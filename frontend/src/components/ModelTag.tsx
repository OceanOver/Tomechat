import { memo } from 'react';

interface ModelTagProps {
  model: string;
}
const ModelTag = memo<ModelTagProps>(({ model }) => (
  <span className="inline-flex items-center whitespace-nowrap text-xs text-muted-foreground">
    {model}
  </span>
));

export default ModelTag;
