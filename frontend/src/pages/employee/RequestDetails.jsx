import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { procurementService } from '../../services/procurementService';
import { Timeline } from '../../components/common/Timeline';
import { ArrowLeft, AlertCircle, FileText, Calendar, User, LayoutGrid, Clock, Package, CheckCircle2, Truck, MapPin } from 'lucide-react';

export const RequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await procurementService.getIssueById(id);
        if (res.data) setRequest(res.data);
      } catch (err) {
        console.error('Error fetching details', err);
        setError('Failed to load request details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center text-red-500 flex flex-col items-center">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>{error || 'Request not found.'}</p>
        <Link to="/dashboard/requests" className="mt-4 text-blue-600 hover:underline">Back to Requests</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/requests" className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Request {request.issueNumber || `#${request.id}`}
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 
              request.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
              'bg-amber-100 text-amber-800'
            }`}>
              {request.status}
            </span>
          </h1>
          <p className="text-sm text-slate-500">Details and approval history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900">Request Information</h2>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Title</h3>
                <p className="mt-1 text-base font-medium text-slate-900">{request.title}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Priority</h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      request.priority === 'CRITICAL' || request.priority === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <span className="font-medium text-slate-900">{request.priority}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Created Date
                  </h3>
                  <p className="mt-1 font-medium text-slate-900">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Category / Items</h3>
                  <p className="mt-1 font-medium text-slate-900">
                    {request.purchaseOrder?.productName || request.category || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Quantity & Amount</h3>
                  <p className="mt-1 font-medium text-slate-900">
                    {request.purchaseOrder?.quantity || request.requestedQuantity || 0} units
                    {request.purchaseOrder?.totalAmount && ` • $${request.purchaseOrder.totalAmount.toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Description</h3>
                <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap">
                  {request.description}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-slate-900">Approval Timeline</h2>
            </div>
            <div className="p-5">
              <Timeline steps={request.approvalSteps || []} />
              
              {(!request.approvalSteps || request.approvalSteps.length === 0) && request.status === 'PENDING' && (
                <div className="flex gap-4">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 shadow-sm border border-white ring-4 ring-white">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-sm font-semibold text-slate-900">Request Submitted</h4>
                    <p className="text-xs text-slate-500 font-medium">Awaiting initial review</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Tracking Timeline */}
          {request.purchaseOrder && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Delivery Tracking</h2>
              </div>
              <div className="p-5">
                <div className="relative">
                  {/* Visual Timeline Line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200"></div>
                  
                  {/* Order Placed */}
                  <div className="relative flex items-start gap-4 mb-8">
                    <div className="relative z-10 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_0_4px_white]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="pt-1.5">
                      <h4 className="text-sm font-bold text-slate-900">Order Placed</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(request.purchaseOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Shipped */}
                  <div className="relative flex items-start gap-4 mb-8">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_white] ${
                      ['SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(request.purchaseOrder.deliveryStatus)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {['SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(request.purchaseOrder.deliveryStatus) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <h4 className={`text-sm font-bold ${
                        ['SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(request.purchaseOrder.deliveryStatus)
                          ? 'text-slate-900' 
                          : 'text-slate-500'
                      }`}>
                        Shipped
                      </h4>
                    </div>
                  </div>

                  {/* Out for Delivery */}
                  <div className="relative flex items-start gap-4 mb-8">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_white] ${
                      ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(request.purchaseOrder.deliveryStatus)
                        ? 'bg-emerald-500 text-white'
                        : request.purchaseOrder.deliveryStatus === 'SHIPPING'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {['DELIVERED'].includes(request.purchaseOrder.deliveryStatus) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : request.purchaseOrder.deliveryStatus === 'OUT_FOR_DELIVERY' ? (
                        <Truck className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Truck className="w-4 h-4" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <h4 className={`text-sm font-bold ${
                        ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(request.purchaseOrder.deliveryStatus)
                          ? 'text-slate-900' 
                          : 'text-slate-500'
                      }`}>
                        Out for Delivery
                      </h4>
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="relative flex items-start gap-4">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_white] ${
                      request.purchaseOrder.deliveryStatus === 'DELIVERED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {request.purchaseOrder.deliveryStatus === 'DELIVERED' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <h4 className={`text-sm font-bold ${
                        request.purchaseOrder.deliveryStatus === 'DELIVERED'
                          ? 'text-emerald-600' 
                          : 'text-slate-500'
                      }`}>
                        Delivered
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
