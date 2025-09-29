import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Eye,
  CheckCircle,
  FileText,
  Download,
  Mail,
  Scale,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../../services/supabase';

interface TimelineStep {
  id: string;
  status: 'received' | 'under_review' | 'posted' | 'completed';
  title: string;
  description: string;
  icon: React.ReactNode;
  completedAt?: string;
  active: boolean;
  completed: boolean;
}

interface AnimatedTimelineProps {
  letterId: string;
  onStatusUpdate?: (status: string) => void;
}

const TIMELINE_STEPS: Omit<TimelineStep, 'active' | 'completed' | 'completedAt'>[] = [
  {
    id: 'received',
    status: 'received',
    title: 'Letter Request Received',
    description: 'Your letter request has been received and queued for processing',
    icon: <Clock className="w-6 h-6" />
  },
  {
    id: 'under_review',
    status: 'under_review',
    title: 'Under Attorney Review',
    description: 'Our AI system is generating your professional legal letter',
    icon: <Scale className="w-6 h-6" />
  },
  {
    id: 'posted',
    status: 'posted',
    title: 'Posted to My Letters',
    description: 'Your letter has been generated and is ready for review',
    icon: <FileText className="w-6 h-6" />
  },
  {
    id: 'completed',
    status: 'completed',
    title: 'Ready for Action',
    description: 'Preview, download, or send your professional legal letter',
    icon: <CheckCircle className="w-6 h-6" />
  }
];

export const AnimatedTimeline: React.FC<AnimatedTimelineProps> = ({
  letterId,
  onStatusUpdate
}) => {
  const [currentStatus, setCurrentStatus] = useState<string>('received');
  const [timelineData, setTimelineData] = useState<TimelineStep[]>([]);
  const [letterData, setLetterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (letterId) {
      loadLetterData();
      setupRealtimeSubscription();
    }
  }, [letterId]);

  const loadLetterData = async () => {
    try {
      setLoading(true);

      // Fetch letter data
      const { data: letter, error: letterError } = await supabase
        .from('letters')
        .select('*')
        .eq('id', letterId)
        .single();

      if (letterError) throw letterError;

      setLetterData(letter);
      setCurrentStatus(letter.timeline_status || 'received');

      // Fetch timeline data
      const { data: timeline, error: timelineError } = await supabase
        .from('letter_timeline')
        .select('*')
        .eq('letter_id', letterId)
        .order('created_at', { ascending: true });

      if (timelineError) throw timelineError;

      // Create timeline steps with completion data
      const steps: TimelineStep[] = TIMELINE_STEPS.map((step, index) => {
        const timelineEntry = timeline?.find(t => t.status === step.status);
        const currentIndex = TIMELINE_STEPS.findIndex(s => s.status === (letter.timeline_status || 'received'));

        return {
          ...step,
          active: index === currentIndex,
          completed: index < currentIndex || (index === currentIndex && letter.timeline_status === 'completed'),
          completedAt: timelineEntry?.created_at
        };
      });

      setTimelineData(steps);

      if (onStatusUpdate) {
        onStatusUpdate(letter.timeline_status || 'received');
      }

    } catch (error: any) {
      console.error('Error loading letter data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`letter-${letterId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'letters',
          filter: `id=eq.${letterId}`
        },
        (payload) => {
          console.log('Letter updated:', payload.new);
          setCurrentStatus(payload.new.timeline_status);
          loadLetterData(); // Reload to get latest data
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'letter_timeline',
          filter: `letter_id=eq.${letterId}`
        },
        (payload) => {
          console.log('Timeline updated:', payload.new);
          loadLetterData(); // Reload to get latest timeline
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handlePreview = () => {
    // Open preview modal or navigate to preview page
    console.log('Preview letter:', letterId);
  };

  const handleDownload = async () => {
    try {
      if (letterData?.pdf_url) {
        // Download existing PDF
        window.open(letterData.pdf_url, '_blank');
      } else {
        // Generate PDF on demand
        console.log('Generating PDF for letter:', letterId);
      }
    } catch (error) {
      console.error('Error downloading letter:', error);
    }
  };

  const handleSendEmail = () => {
    // Open email sending modal
    console.log('Send email for letter:', letterId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>Error loading timeline: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Progress line */}
        <motion.div
          className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-green-500"
          initial={{ height: 0 }}
          animate={{
            height: `${(timelineData.filter(step => step.completed).length / timelineData.length) * 100}%`
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        <div className="space-y-8">
          {timelineData.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative flex items-start"
            >
              {/* Icon */}
              <motion.div
                className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                  step.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.active
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                animate={step.active && !step.completed ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.5)",
                    "0 0 0 20px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)"
                  ]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: step.active && !step.completed ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {step.completed ? (
                  <CheckCircle className="w-8 h-8" />
                ) : step.active ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8" />
                  </motion.div>
                ) : (
                  step.icon
                )}
              </motion.div>

              {/* Content */}
              <div className="ml-6 flex-1">
                <motion.div
                  className={`p-6 rounded-xl border-2 ${
                    step.completed
                      ? 'bg-green-50 border-green-200'
                      : step.active
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  animate={step.active && !step.completed ? {
                    borderColor: ["rgb(196, 181, 253)", "rgb(139, 92, 246)", "rgb(196, 181, 253)"]
                  } : {}}
                  transition={{ duration: 2, repeat: step.active && !step.completed ? Infinity : 0 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        step.completed ? 'text-green-800' : step.active ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`${
                        step.completed ? 'text-green-700' : step.active ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>

                      {step.completedAt && (
                        <p className="text-sm text-gray-500 mt-2">
                          Completed: {new Date(step.completedAt).toLocaleString()}
                        </p>
                      )}

                      {step.active && !step.completed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3 flex items-center text-blue-600"
                        >
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm font-medium">Processing...</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Action buttons for completed step */}
                    {step.status === 'completed' && step.completed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex space-x-2 ml-4"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePreview}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDownload}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendEmail}
                          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Letter Details */}
      {letterData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Letter Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Title:</span>
              <span className="ml-2 font-medium">{letterData.title}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium">{letterData.letter_type?.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-gray-500">Recipient:</span>
              <span className="ml-2 font-medium">{letterData.recipient_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Priority:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                letterData.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                letterData.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                letterData.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {letterData.priority}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Estimated Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-2">⏱️ Estimated Timeline</h3>
        <p className="text-blue-700">
          Your letter is typically generated within 2-5 minutes. Complex legal matters may take up to 15 minutes.
        </p>
      </motion.div>
    </div>
  );
};