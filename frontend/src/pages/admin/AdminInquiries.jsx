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
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-900/30 text-blue-400' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-900/30 text-yellow-400' },
  { value: 'responded', label: 'Responded', color: 'bg-green-900/30 text-green-400' },
  { value: 'closed', label: 'Closed', color: 'bg-phileon-charcoal text-phileon-ivory-muted' },
];

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchInquiries = async () => {
    try {
      const response = await adminApi.getInquiries();
      setInquiries(response.data);
    } catch (error) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await adminApi.updateInquiry(inquiryId, { status: newStatus });
      toast.success('Status updated');
      fetchInquiries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleNotesUpdate = async () => {
    try {
      await adminApi.updateInquiry(selectedInquiry.id, { admin_notes: adminNotes });
      toast.success('Notes saved');
      fetchInquiries();
      setSelectedInquiry(null);
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const openInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || '');
  };

  const filteredInquiries = filterStatus === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === filterStatus);

  const getStatusStyle = (status) => {
    return statusOptions.find(s => s.value === status)?.color || '';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div data-testid="admin-inquiries">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory">Inquiries</h1>
          <p className="text-phileon-ivory-muted text-sm mt-1">
            {inquiries.filter(i => i.status === 'new').length} new inquiries
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
            <SelectItem value="all">All Inquiries</SelectItem>
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
      ) : filteredInquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-phileon-charcoal p-6 cursor-pointer hover:bg-phileon-charcoal/80 transition-colors"
              onClick={() => openInquiry(inquiry)}
              data-testid={`inquiry-${inquiry.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-phileon-near-black">
                    <MessageSquare size={20} className="text-phileon-gold" />
                  </div>
                  <div>
                    <h3 className="text-phileon-ivory font-medium">{inquiry.name}</h3>
                    <p className="text-phileon-ivory-muted text-sm">{inquiry.email}</p>
                    <p className="text-phileon-ivory-muted text-xs mt-1 capitalize">
                      {inquiry.inquiry_type.replace('_', ' ')}
                      {inquiry.budget_range && ` • ${inquiry.budget_range}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-3 py-1 ${getStatusStyle(inquiry.status)}`}>
                    {statusOptions.find(s => s.value === inquiry.status)?.label}
                  </span>
                  <p className="text-phileon-ivory-muted text-xs mt-2">
                    {formatDate(inquiry.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-phileon-ivory-muted text-sm mt-4 line-clamp-2">
                {inquiry.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-phileon-charcoal">
          <p className="text-phileon-ivory-muted">No inquiries found</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl tracking-wider">
                  Inquiry from {selectedInquiry.name}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-phileon-charcoal">
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Email</p>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-phileon-gold hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <p className="text-xs text-phileon-ivory-muted">Phone</p>
                      <p>{selectedInquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Type</p>
                    <p className="capitalize">{selectedInquiry.inquiry_type.replace('_', ' ')}</p>
                  </div>
                  {selectedInquiry.budget_range && (
                    <div>
                      <p className="text-xs text-phileon-ivory-muted">Budget</p>
                      <p>{selectedInquiry.budget_range}</p>
                    </div>
                  )}
                  {selectedInquiry.timeline && (
                    <div>
                      <p className="text-xs text-phileon-ivory-muted">Timeline</p>
                      <p>{selectedInquiry.timeline}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-phileon-ivory-muted">Received</p>
                    <p>{formatDate(selectedInquiry.created_at)}</p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <p className="text-xs text-phileon-ivory-muted mb-2">Message</p>
                  <p className="text-phileon-ivory leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-phileon-ivory-muted mb-2">Status</p>
                  <Select 
                    value={selectedInquiry.status} 
                    onValueChange={(value) => handleStatusChange(selectedInquiry.id, value)}
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
                    placeholder="Add notes about this inquiry..."
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

export default AdminInquiries;
