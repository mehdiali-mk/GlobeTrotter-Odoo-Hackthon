import { useState } from "react";
import Card, { CardHeader, CardBody } from "./ui/Card";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { TextField, SelectField } from "./ui/Field";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { canManageMembers, memberRoles, roleLabel } from "../utils/permissions";
import { useInviteMember, useRemoveMember, useUpdateMember, useCurrentUser } from "../hooks/useApi";

const roleOptions = memberRoles.map((role) => ({ value: role, label: roleLabel(role) }));

// Members panel for a trip: shows every member with role and status, and lets
// the owner invite people, change roles and remove members.
export default function MemberList({ trip }) {
  const { showToast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [memberToRemove, setMemberToRemove] = useState(null);

  const { data: currentUser } = useCurrentUser();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const updateMember = useUpdateMember();

  const members = trip.members || [];
  const canManage = canManageMembers(trip, currentUser);
  const acceptedCount = members.filter((member) => member.status === "accepted").length;

  function handleInvite(event) {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMember.mutate(
      { tripId: trip._id, email: inviteEmail, role: inviteRole },
      {
        onSuccess: (data) => {
          showToast(data.message || "Invite sent", "success");
          setInviteEmail("");
        },
        onError: (err) => {
          showToast(err.response?.data?.message || "Failed to invite member", "danger");
        }
      }
    );
  }

  function handleRemove() {
    const memberId = typeof memberToRemove.user === 'object' ? memberToRemove.user._id : memberToRemove.user;
    const memberName = typeof memberToRemove.user === 'object' ? memberToRemove.user.name : "Member";

    removeMember.mutate(
      { tripId: trip._id, userId: memberId },
      {
        onSuccess: () => {
          showToast(`${memberName} removed from the trip`, "danger");
          setMemberToRemove(null);
        },
        onError: (err) => {
          showToast(err.response?.data?.message || "Failed to remove member", "danger");
          setMemberToRemove(null);
        }
      }
    );
  }

  return (
    <Card>
      <CardHeader title="Members" description={`${acceptedCount} of ${trip.maxMembers} joined`} />
      <CardBody className="space-y-4">
        <ul className="space-y-3">
          {members.map((member) => {
            const memberId = typeof member.user === 'object' ? member.user._id : member.user;
            const memberData = typeof member.user === 'object' ? member.user : {};
            return (
              <li key={memberId} className="rounded-lg border border-border px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Avatar name={memberData.name || 'Unknown'} photo={memberData.photo} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{memberData.name || 'Member'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {roleLabel(member.role)} {memberData.city ? `· ${memberData.city}` : ''}
                    </p>
                  </div>

                  <Badge
                    tone={
                      member.status === "accepted"
                        ? "success"
                        : member.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {member.status}
                  </Badge>
                </div>

                {canManage && member.role !== "owner" && memberId !== trip.creator?._id && memberId !== trip.creator ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <select
                      aria-label={`Role for ${memberData.name || 'Member'}`}
                      value={member.role}
                      onChange={(event) =>
                        updateMember.mutate({ tripId: trip._id, userId: memberId, role: event.target.value })
                      }
                      className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {/* The backend auto-accepts members joining via joinCode. Pending status is for invited members. */}
                    {member.status !== "accepted" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMember.mutate({ tripId: trip._id, userId: memberId, status: "accepted" })}
                      >
                        Accept
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={() => setMemberToRemove(member)}>
                      Remove
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        {canManage ? (
          <form onSubmit={handleInvite} className="space-y-3 border-t border-border pt-4">
            <TextField
              id="invite-email"
              label="Invite by email"
              type="email"
              placeholder="teammate@example.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
            />
            <SelectField
              id="invite-role"
              label="Role"
              options={roleOptions}
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value)}
            />
            <Button type="submit" variant="secondary" size="sm" className="w-full justify-center">
              Send invite
            </Button>
          </form>
        ) : null}
      </CardBody>

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        title="Remove member?"
        message={memberToRemove ? `${typeof memberToRemove.user === 'object' ? memberToRemove.user.name : "Member"} will lose access to this trip.` : ""}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setMemberToRemove(null)}
        loading={removeMember.isPending}
      />
    </Card>
  );
}
