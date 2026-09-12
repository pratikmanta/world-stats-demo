import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export function IndicatorCard({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId?: string;
}) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p
          data-testid={testId}
          className="text-2xl font-semibold tracking-tight"
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
