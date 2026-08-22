import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import PageHeader, { SectionHeader } from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button, { ButtonLink } from "../components/ui/Button";
import TripForm from "../components/TripForm";
import CityCard from "../components/CityCard";
import ActivityCard from "../components/ActivityCard";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";

// SCREEN 4 — Plan a new trip. The form sets the basics and the suggestions
// below let the traveller pick the first place and a few activities up front.
export default function CreateTripPage() {
  const data = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const user = data.currentUser;

  const [selectedCityId, setSelectedCityId] = useState(data.cities[0] ? data.cities[0]._id : "");
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);

  const selectedCity = data.getCityById(selectedCityId);
  const suggestedActivities = data.catalog.filter(
    (activity) => !selectedCityId || activity.city === selectedCityId,
  );
  const activitiesToShow =
    suggestedActivities.length > 0 ? suggestedActivities : data.catalog.slice(0, 4);

  function toggleActivity(activityId) {
    setSelectedActivityIds((current) =>
      current.includes(activityId)
        ? current.filter((id) => id !== activityId)
        : [...current, activityId],
    );
  }

  function handleSubmit(values) {
    const trip = data.createTrip({ ...values, suggestedActivities: selectedActivityIds });
    showToast(`"${trip.title}" created`);
    navigate({ to: "/trips/$tripId/itinerary", params: { tripId: trip._id } });
  }

  return (
    <>
      <PageHeader
        eyebrow="Create trip"
        title="Plan a new trip"
        description="Set the dates and the first place, then pick a few suggestions to start the itinerary."
        actions={
          <ButtonLink to="/trips" variant="secondary">
            My trips
          </ButtonLink>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card as="section">
          <CardHeader title="Trip details" description={`Organised by ${user.name}`} />
          <CardBody>
            <TripForm
              id="create-trip-page-form"
              cities={data.cities}
              placeSearch
              selectedCityId={selectedCityId}
              onSelectCity={setSelectedCityId}
              onSubmit={handleSubmit}
              footer={
                <div className="flex flex-wrap gap-2">
                  <Button type="submit">Create trip</Button>
                  <ButtonLink to="/discover" variant="secondary">
                    Browse destinations
                  </ButtonLink>
                </div>
              }
            />
          </CardBody>
        </Card>

        <Card as="aside">
          <CardHeader
            title="How planning works"
            description="Three steps from an empty trip to a full itinerary."
          />
          <CardBody>
            <ol className="space-y-4 text-sm">
              <Step
                number="1"
                title="Create the trip"
                detail="Name, dates, budget and how many people can join."
              />
              <Step
                number="2"
                title="Add city stops"
                detail="Each stop has arrival and departure dates, a stay and notes."
              />
              <Step
                number="3"
                title="Fill in activities"
                detail="Pick from the catalog or add your own, then track costs in the budget."
              />
            </ol>

            {selectedActivityIds.length > 0 ? (
              <p className="mt-5 rounded-md bg-primary-soft px-3 py-2 text-sm text-primary">
                {selectedActivityIds.length} suggested{" "}
                {selectedActivityIds.length === 1 ? "activity" : "activities"} will be added to the
                first stop.
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <section className="mt-10">
        <SectionHeader
          title="Suggestion for Places to Visit / Activities to perform"
          description={
            selectedCity
              ? `Selected place: ${selectedCity.name}, ${selectedCity.country}`
              : "Pick a place to see matching activities"
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.cities.map((city) => (
            <CityCard
              key={city._id}
              city={city}
              action={
                <Button
                  variant={city._id === selectedCityId ? "primary" : "secondary"}
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setSelectedCityId(city._id)}
                >
                  {city._id === selectedCityId ? "Selected place" : "Select this place"}
                </Button>
              }
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {activitiesToShow.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              action={
                <Button
                  variant={selectedActivityIds.includes(activity._id) ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => toggleActivity(activity._id)}
                >
                  {selectedActivityIds.includes(activity._id) ? "Added" : "Add"}
                </Button>
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}

function Step({ number, title, detail }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
        {number}
      </span>
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}
