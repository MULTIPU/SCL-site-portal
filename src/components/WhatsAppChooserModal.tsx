import React from 'react';
import { X, MessageCircle, Users, Award, Wrench, Mail, ExternalLink } from 'lucide-react';

interface WhatsAppChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppChooserModal: React.FC<WhatsAppChooserModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const contacts = [
    {
      id: 'parents',
      title: 'SCL Parents Official Community',
      subtitle: 'Join PTA updates, term announcements & notices',
      icon: Users,
      color: 'bg-emerald-600',
      actionUrl: 'https://chat.whatsapp.com/sample-scl-parents-group',
      tag: 'Public Group'
    },
    {
      id: 'management',
      title: 'School Management & Accounts',
      subtitle: 'School fees verification, admissions & directorship',
      icon: Award,
      color: 'bg-amber-600',
      actionUrl: 'https://wa.me/2348023456789?text=Hello%20SCL%20Management,%20I%20have%20an%20inquiry%20regarding%20school%20fees/admissions.',
      tag: 'Management'
    },
    {
      id: 'affairs',
      title: 'Student Affairs & Guidance',
      subtitle: 'Student welfare, pastoral care & class teacher inquiries',
      icon: MessageCircle,
      color: 'bg-emerald-700',
      actionUrl: 'https://wa.me/2348139876543?text=Hello%20SCL%20Student%20Affairs,%20I%20am%20inquiring%20about%20my%20child.',
      tag: 'Student Affairs'
    },
    {
      id: 'technical',
      title: 'Technical Support & Portal Help',
      subtitle: 'SCL Binary ID numbers, password reset, results upload help',
      icon: Wrench,
      color: 'bg-blue-600',
      actionUrl: 'https://wa.me/2347035551212?text=Hello%20SCL%20Tech%20Support,%20I%20need%20assistance%20with%20my%20portal%20access.',
      tag: 'Technical'
    },
    {
      id: 'email',
      title: 'Official School Email Address',
      subtitle: 'shiningchildleader@gmail.com',
      icon: Mail,
      color: 'bg-purple-700',
      actionUrl: 'mailto:shiningchildleader@gmail.com?subject=Inquiry%20from%20SCL%20Portal',
      tag: 'Official Mail'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-[#2e1052] to-[#1c0734] text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-300/60 relative animate-in zoom-in-95 duration-200"
      >
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center mx-auto mb-3 shadow-[0_8px_20px_rgba(16,185,129,0.4)] border border-white/30">
          <MessageCircle className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="font-black text-xl text-amber-200 tracking-wide">Connect with SCL Helpdesk</h3>
          <p className="text-xs text-purple-200/80 mt-1">
            Choose the specific department you wish to message on WhatsApp or email
          </p>
        </div>

        {/* Contact Choices */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {contacts.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.id}
                href={c.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-300/30 hover:border-amber-400 transition-all active:scale-98 group"
              >
                <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-200 transition">
                      {c.title}
                    </h4>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-semibold whitespace-nowrap">
                      {c.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/70 truncate mt-0.5">
                    {c.subtitle}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-amber-300/70 flex-shrink-0 opacity-70 group-hover:opacity-100" />
              </a>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold border border-amber-400/40 transition active:scale-95"
          >
            Close Helpdesk
          </button>
        </div>
      </div>
    </div>
  );
};
