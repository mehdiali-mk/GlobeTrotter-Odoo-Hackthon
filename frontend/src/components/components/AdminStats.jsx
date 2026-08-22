import Card, { CardBody } from "./ui/Card";

// Grid of headline numbers. `stats` is [{ label, value, hint }].
export default function AdminStats({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardBody>
            <p className="eyebrow">{stat.label}</p>
            <p className="mt-1.5 truncate text-2xl font-semibold">{stat.value}</p>
            {stat.hint ? <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p> : null}
          </CardBody>
        </Card>
      ))}
    </section>
  );
}
