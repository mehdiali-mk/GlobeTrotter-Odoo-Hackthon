import { useState, useEffect } from "react";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button, { ButtonLink } from "../components/ui/Button";
import { SelectField } from "../components/ui/Field";
import ItinerarySection, { sectionTypes } from "../components/ItinerarySection";
import { useToast } from "../context/ToastContext";
import { useMyTrips } from "../hooks/useApi";
import { tripService } from "../services/api/tripService";
import { formatMoney, countDays } from "../utils/format";
import { toDateInputValue } from "../services/tripService";

let sectionCounter = 0;

function makeSection(values = {}) {
  sectionCounter += 1;
  return {
    id: `section_new_${sectionCounter}`,
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    type: sectionTypes[0],
    ...values,
  };
}

// The three starter sections use fixed ids so the server render and the
// browser render produce exactly the same markup.
const starterSections = [
  {
    ...makeSection(),
    id: "section_1",
    title: "Section 1 — Arrival and city stay",
    description: "Land, settle into the stay and walk the neighbourhood.",
    type: "City stay",
  },
  {
    ...makeSection(),
    id: "section_2",
    title: "Section 2 — Main activities",
    description: "The booked activities and day trips of this leg.",
    type: "Activity block",
  },
  {
    ...makeSection(),
    id: "section_3",
    title: "Section 3 — Travel to the next city",
    description: "Transfer day with light plans on either side.",
    type: "Travel day",
  },
];

// Screen 5 — Build itinerary. Sections are editable and can be added or
// removed without a page reload. The shape matches the future API document.
export default function BuildItineraryPage() {
  const { showToast } = useToast();
  const { data: trips = [], isLoading: tripsLoading } = useMyTrips();

  const [tripId, setTripId] = useState("");
  const [sections, setSections] = useState(starterSections);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);

  useEffect(() => {
    if (trips.length > 0 && !tripId) {
      setTripId(trips[0]._id);
    }
  }, [trips, tripId]);

  const trip = trips.find((item) => item._id === tripId) || null;

  function updateSection(id, next) {
    setSections((current) => current.map((section) => (section.id === id ? next : section)));
  }

  function removeSection(id) {
    setSections((current) => current.filter((section) => section.id !== id));
  }

  function addSection() {
    setSections((current) => [...current, makeSection({ title: `Section ${current.length + 1}` })]);
  }

  // Pulls the city stops of the selected trip in as sections.
  async function loadFromTrip() {
    if (!trip) return;
    
    setIsLoadingItinerary(true);
    try {
      const response = await tripService.getTripItinerary(trip._id);
      const stops = response.data?.stops || [];
      const activities = response.data?.activities || [];
      
      if (stops.length === 0) {
        showToast("That trip has no stops yet", "danger");
        setIsLoadingItinerary(false);
        return;
      }
      
      setSections(
        stops.map((stop) => {
          const stopActivities = activities.filter(a => {
            const stopId = typeof a.stop === 'object' ? a.stop._id : a.stop;
            return stopId === stop._id;
          });
          
          const totalCost = stopActivities.reduce((total, activity) => total + Number(activity.cost || 0), 0);
          
          return makeSection({
            title: `${stop.cityName} — city stay`,
            description: stop.notes || `Staying at ${stop.accommodation || "a place to confirm"}.`,
            startDate: toDateInputValue(stop.arrivalDate),
            endDate: toDateInputValue(stop.departureDate),
            budget: String(totalCost),
            type: "City stay",
          });
        })
      );
      showToast(`Loaded ${stops.length} stops from "${trip.title}"`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load itinerary", "danger");
    } finally {
      setIsLoadingItinerary(false);
    }
  }

  const totalBudget = sections.reduce((total, section) => total + (Number(section.budget) || 0), 0);
  const totalDays = sections.reduce(
    (total, section) =>
      total +
      (section.startDate && section.endDate ? countDays(section.startDate, section.endDate) : 0),
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Build itinerary"
        title="Build your itinerary"
        description="Break the journey into sections, then set the dates and budget of each one."
        actions={
          <>
            <ButtonLink to="/itinerary-view" variant="secondary">
              Itinerary view
            </ButtonLink>
            <ButtonLink to="/create-trip">New trip</ButtonLink>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <ItinerarySection
              key={section.id}
              section={section}
              index={index}
              onChange={updateSection}
              onRemove={removeSection}
              canRemove={sections.length > 1}
            />
          ))}

          <Button variant="secondary" className="w-full justify-center" onClick={addSection}>
            + Add another Section
          </Button>
        </div>

        <div className="space-y-6">
          <Card as="aside">
            <CardHeader title="Itinerary summary" description="Updates as you edit the sections." />
            <CardBody>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="eyebrow">Sections</dt>
                  <dd className="mt-1 text-xl font-semibold">{sections.length}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Days planned</dt>
                  <dd className="mt-1 text-xl font-semibold">{totalDays}</dd>
                </div>
                <div className="col-span-2 border-t border-border pt-4">
                  <dt className="eyebrow">Total section budget</dt>
                  <dd className="mt-1 text-xl font-semibold">{formatMoney(totalBudget)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card as="aside">
            <CardHeader
              title="Start from a trip"
              description="Reuse the stops you already saved."
            />
            <CardBody className="space-y-4">
              {tripsLoading ? (
                <p className="text-sm text-muted-foreground">Loading trips...</p>
              ) : trips.length > 0 ? (
                <>
                  <SelectField
                    id="itinerary-trip"
                    label="Trip"
                    value={tripId}
                    onChange={(event) => setTripId(event.target.value)}
                    options={trips.map((item) => ({ value: item._id, label: item.title }))}
                  />
                  <Button
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={loadFromTrip}
                    disabled={isLoadingItinerary}
                  >
                    {isLoadingItinerary ? "Loading..." : "Load stops as sections"}
                  </Button>
                  {trip ? (
                    <p className="text-xs text-muted-foreground">
                      Trip budget {formatMoney(trip.totalBudget)} · sections currently add up to{" "}
                      {formatMoney(totalBudget)}.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Create a trip first and its stops can be loaded here.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
