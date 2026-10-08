import { memo } from 'react';

import AccessCodeForm from './AccessCodeForm';
import { ErrorActionContainer } from './style';

interface InvalidAccessCodeProps {
  id: string;
}

const InvalidAccessCode = memo<InvalidAccessCodeProps>(({ id }) => {
  return (
    <ErrorActionContainer>
      <AccessCodeForm id={id} />
    </ErrorActionContainer>
  );
});

export default InvalidAccessCode;
