import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ... type definitions (unchanged)

const ViewReport = memo(({ record }: Props) => {
  const report = record.report || {
    chiefComplaint: 'No complaint provided.',
    summary: 'No summary available.',
    symptoms: [],
    duration: 'Not specified',
    severity: 'Not specified',
    medicationsMentioned: [],
    recommendations: [],
  };

  let formattedDate = 'Unknown';
  if (record?.createdOn) {
    try {
      formattedDate = format(new Date(record.createdOn), 'MMMM dd, yyyy, hh:mm a');
    } catch (e) {
      console.error('Invalid date format:', record.createdOn);
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant={'ghost'}
          size={'sm'}
          aria-label={`View medical report for session ${record.sessionId}`}
        >
          View Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className="text-center text-2xl font-bold text-gray-800">
              Medical AI Voice Agent Report
            </h2>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Session Info */}
              <div>
                <h2 className="font-semibold text-blue-600 text-lg">Session Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Doctor:</span>{' '}
                    {record?.selectedDoctor?.specialist || 'Unknown Specialist'}
                  </p>
                  <p>
                    <span className="font-medium">User:</span> {record?.userName || 'Anonymous'}
                  </p>
                  <p>
                    <span className="font-medium">Consulted On:</span> {formattedDate}
                  </p>
                  <p>
                    <span className="font-medium">Agent:</span>{' '}
                    {record?.selectedDoctor?.specialist || 'Unknown'} AI
                  </p>
                </div>
              </div>
              <hr className="border-t border-gray-200 my-4" />
              {/* Chief Complaint */}
              <div>
                <h2 className="font-semibold text-blue-600 text-lg">Chief Complaint</h2>
                <p className="mt-2 text-sm text-gray-700">{report.chiefComplaint}</p>
              </div>
              <hr className="border-t border-gray-200 my-4" />
              {/* Summary */}
              <div>
                <h2 className="font-semibold text-blue-600 text-lg">Summary</h2>
                <p className="mt-2 text-sm text-gray-700">{report.summary}</p>
              </div>
              <hr className="border-t border-gray-200 my-4" />
              {/* Symptoms */}
              <div>
                <h2 className="font-semibold text-blue-600 text-lg">Symptoms</h2>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                  {report.symptoms.length > 0 ? (
                    report.symptoms.map((symptom, index) => <li key={index}>{symptom}</li>)
                  ) : (
                    <li>No symptoms reported.</li>
                  )}
                </ul>
              </div>
              <hr className="border-t border-gray-200 my-4" />
              {/* Duration & Severity */}
              <div>
                <h2 className="font-semibold text-blue-600 text-lg">Duration & Severity</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Duration:</span> {report.duration}
                  </p>
                  <p>
                    <span className="font-medium">Severity:</span> {report.severity}
                  </p>
                </div>
              </div>
              <hr className="border-t border-gray-200 my-4" />
              {/* Medications Mentioned */}
              <div>
                <h2 className="font-semibold text-blue-600 text-lg">Medications Mentioned</h2>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                  {report.medicationsMentioned.length > 0 ? (
                    report.medicationsMentioned.map((med, index) => <li key={index}>{med}</li>)
                  ) : (
                    <li>No medications mentioned.</li>
                  )}
                </ul>
              </div>
              <hr className="border-t border-gray-200 my-4" />
              {/* Recommendations */}
              <div>
                <h2 className="font-semibold text-blue-600 text-lg">Recommendations</h2>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                  {report.recommendations.length > 0 ? (
                    report.recommendations.map((rec, index) => <li key={index}>{rec}</li>)
                  ) : (
                    <li>No recommendations provided.</li>
                  )}
                </ul>
              </div>
              <hr className="border-t border-gray-200 my-4" />
              {/* Disclaimer */}
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>Disclaimer:</strong> This report was generated by an AI Medical
                  Assistant for informational purposes only.
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
});

export default ViewReport;