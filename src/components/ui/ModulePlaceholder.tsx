import { PageHeader } from "@/components/ui/PageHeader";

type ModulePlaceholderProps = {
  title: string;
};

export function ModulePlaceholder({ title }: ModulePlaceholderProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={`${title} management will be configured in a future build.`} />
    </div>
  );
}
