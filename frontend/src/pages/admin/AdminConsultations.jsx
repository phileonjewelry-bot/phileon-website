import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Video, MapPin } from 'lucide-react';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-900/30 text-yellow-400' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-900/30 text-green-400' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-900/30 text-blue-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-900/30 text-red-400' },
];

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchConsultations = async () => {
    try {
      const response = await adminApi.getConsultations();
      setConsultations(response.data);
    } catch (error) {
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleStatusChange = async (consultationId, newStatus) => {
    try {
      await adminApi.updateConsultation(consultationId, { status: newStatus });
      toast.success('Status updated');
      fetchConsultations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleNotesUpdate = async () => {
    try {
      await adminApi.updateConsultation(selectedConsultation.id, { admin_notes: adminNotes });
      toast.success('Notes saved');
      fetchConsultations();
      setSelectedConsultation(null);
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const openConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setAdminNotes(consultation.admin_notes || '');
  };

  const filteredConsultations = filterStatus === 'all' 
    ? consultations 
    : consultations.filter(c => c.status === filterStatus);

  const getStatusStyle = (status) => {
    return statusOptions.find(s => s.value === status)?.color || '';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div data-testid="admin-consultations">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory">Consultations</h1>
          <p className="text-phileon-ivory-muted text-sm mt-1">
            {consultations.filter(c => c.status === 'pending').length} pending requests
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
            <SelectItem value="all">All Consultations</SelectItem>
            {statusOptions.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredConsultations.length > 0 ? (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <div
              key={consultation.id}
              className="bg-phileon-charcoal p-6 cursor-pointer hover:bg-phileon-charcoal/80 transition-colors"
              onClick={() => openConsultation(consultation)}
              data-testid={`consultation-${consultation.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-phileon-near-black">
                    {consultation.consultation_type === 'virtual' ? (
                      <Video size={20} className="text-phileon-gold" />
                    ) : (
                      <MapPin size={20} className="text-phileon-gold" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-phileon-ivory font-medium">{consultation.name}</h3>
                    <p className="text-phileon-ivory-muted text-sm">{consultation.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-phileon-gold text-sm flex items-center gap-1">
                        <Calendar size={14} />
                        {consultation.preferred_date}
                      </span>
                      <span className="text-phileon-ivory-muted text-sm">
                        {consultation.preferred_time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-3 py-1 ${getStatusStyle(consultation.status)}`}>
                    {statusOptions.find(s => s.value === consultation.status)?.label}
                  </span>
                  <p className="text-phileon-ivory-muted text-xs mt-2 capitalize">
                    {consultation.interest}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-phileon-charcoal">
          <p className="text-phileon-ivory-muted">No consultation requests found</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedConsultation} onOpenChange={() => setSelectedConsultation(null)}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-2xl">
          {selectedConsultation && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl tracking-wider">
                  Consultation with {selectedConsultation.name}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-6">
                {/* Contact & Scheduling Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-phileon-charcoal">
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Email</p>
                    <a href={`mailto:${selectedConsultation.email}`} className="text-phileon-gold hover:underline">
                      {selectedConsultation.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Phone</p>
                    <p>{selectedConsultation.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Preferred Date</p>
                    <p>{selectedConsultation.preferred_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Preferred Time</p>
                    <p>{selectedConsultation.preferred_time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Type</p>
                    <p className="capitalize">{selectedConsultation.consultation_type === 'virtual' ? 'Virtual (Video Call)' : 'In-Person'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Interest</p>
                    <p className="capitalize">{selectedConsultation.interest}</p>
                  </div>
                </div>

                {/* Message */}
                {selectedConsultation.message && (
                  <div>
                    <p className="text-xs text-phileon-ivory-muted mb-2">Additional Notes</p>
                    <p className="text-phileon-ivory leading-relaxed">
                      {selectedConsultation.message}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <p className="text-xs text-phileon-ivory-muted mb-2">Status</p>
                  <Select 
                    value={selectedConsultation.status} 
                    onValueChange={(value) => handleStatusChange(selectedConsultation.id, value)}
                  >
                    <SelectTrigger className="w-48 bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                      {statusOptions.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Notes */}
                <div>
                  <p className="text-xs text-phileon-ivory-muted mb-2">Admin Notes</p>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about this consultation..."
                    className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory resize-none"
                  />
                  <Button onClick={handleNotesUpdate} className="btn-primary mt-2">
                    Save Notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminConsultations;
