import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_WRAPPER_KEY = 'skipResponseWrapper';

/** Apply to any handler that must not be wrapped (e.g. @Redirect endpoints). */
export const SkipResponseWrapper = () =>
  SetMetadata(SKIP_RESPONSE_WRAPPER_KEY, true);
