// Marketing side panel shown next to the login and registration forms.
const highlights = [
  {
    title: "Multi-city routes",
    text: "Order your stops, set arrival dates and see the nights in each city.",
  },
  {
    title: "Shared budgets",
    text: "Track expenses per category and split them across trip members.",
  },
  {
    title: "Plans worth copying",
    text: "Publish a trip or start from an itinerary someone else has shared.",
  },
];

export default function AuthAside() {
  return (
    <div className="max-w-md">
      <p className="eyebrow">Plan together</p>
      <h2 className="mt-2 text-2xl">One workspace for the whole journey</h2>
      <ul className="mt-8 space-y-6">
        {highlights.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
