/**
 * Legacy compatibility alias for KritiService
 * Ensures any residual references resolve cleanly to the unified KritiAI service.
 */
import { kritiService } from './kritiService';

export const kittyService = kritiService;
export default kritiService;
