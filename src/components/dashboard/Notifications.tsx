'use client';

import React from 'react';
import { Bell, Check, AlertCircle, Info, X } from 'lucide-react';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'success',
    title: 'Project Completed',
    message: 'Your "E-commerce Website" project has been successfully completed',
    time: '5 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'info',
    title: 'New Task Assigned',
    message: 'You have been assigned to "Database Optimization" task',
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    type: 'warning',
    title: 'Deadline Reminder',
    message: '3 tasks are due tomorrow. Please review your schedule',
    time: '2 hours ago',
    read: true
  },
  {
    id: 4,
    type: 'info',
    title: 'System Update',
    message: 'Scheduled maintenance will occur tonight at 11 PM',
    time: '4 hours ago',
    read: true
  },
  {
    id: 5,
    type: 'success',
    title: 'Team Member Added',
    message: 'John Smith has been added to your project team',
    time: '1 day ago',
    read: true
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <Check className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'error':
      return <X className="w-5 h-5 text-red-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-[#14a67e]/10 rounded-xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-[#14a67e]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100">Notifications</h2>
          <p className="text-[#0c272d]/60 dark:text-gray-400">View and manage your notifications</p>
        </div>
        <div className="bg-[#14a67e]/10 px-4 py-2 rounded-xl">
          <span className="text-sm font-medium text-[#14a67e]">
            {mockNotifications.filter(n => !n.read).length} unread
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50 p-6 transition-all duration-200 hover:shadow-lg ${
              !notification.read ? 'ring-2 ring-[#14a67e]/20 dark:ring-[#14a67e]/30' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`mt-1 p-2 rounded-lg border ${getNotificationBgColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[#0c272d] dark:text-gray-100">{notification.title}</h3>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-[#14a67e] rounded-full"></span>
                  )}
                </div>
                <p className="text-[#0c272d]/70 dark:text-gray-300 mb-2">{notification.message}</p>
                <span className="text-xs text-[#0c272d]/50 dark:text-gray-500">{notification.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {mockNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-[#0c272d]/20 mx-auto mb-4" />
          <p className="text-[#0c272d]/60 dark:text-gray-400">No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
