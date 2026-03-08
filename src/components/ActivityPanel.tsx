import React from "react";
import { ActivityEvent } from "@/types";
import { Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface ActivityPanelProps {
  activities: ActivityEvent[];
}

export const ActivityPanel = ({ activities }: ActivityPanelProps) => {
  return (
    <div className="w-64 border-l border-gray-200 bg-white h-full flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <Activity className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">Activity Log</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Clock className="h-8 w-8 mb-2 text-gray-400" />
            <p className="text-xs text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, i) => (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.5) }}
              key={activity.id} 
              className="flex gap-3 relative"
            >
              {i !== activities.length - 1 && (
                <div className="absolute top-6 left-[11px] bottom-[-20px] w-0.5 bg-gray-100" />
              )}
              
              <div 
                className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 ring-2 ring-white text-[10px] font-bold text-white shadow-sm z-10"
                style={{ backgroundColor: activity.userColor }}
              >
                {activity.userName[0].toUpperCase()}
              </div>
              
              <div className="flex flex-col flex-1 pb-1">
                <p className="text-xs text-gray-800 leading-snug">
                  <span className="font-semibold text-gray-900">{activity.userName}</span> {activity.action}
                  {activity.cellId && <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">{activity.cellId}</span>}
                </p>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {activity.timestamp?.toDate ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
