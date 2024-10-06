import { model, Schema } from 'mongoose';
import { IActivityLog } from './activitylogs.interface';

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, // Reference to the user who performed the action
    action: {
      type: String,
      required: true,
    }, // Description of the action, e.g., 'Login', 'Create Post'. For now only login// When the action occurred
  },
  {
    timestamps: true,
  },
);

export const ActivityLog = model('ActivityLog', activityLogSchema);
