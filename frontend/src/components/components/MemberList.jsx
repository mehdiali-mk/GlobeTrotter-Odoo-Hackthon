import { useState } from "react";
import Card, { CardHeader, CardBody } from "./ui/Card";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { TextField, SelectField } from "./ui/Field";
import ConfirmDialog from "./ConfirmDialog";
import { useAppData } from "../context/AppDataContext";
import { useToast } from "../context/ToastContext";
import { canManageMembers, memberRoles, roleLabel } from "../utils/permissions";

const roleOptions = memberRoles.map((role) => ({ value: role, label: roleLabel(role) }));

// Members panel for a trip: shows every member with role and status, and lets
// the owner invite people, change roles and remove members.
export default function MemberList({ trip }) {
  const data = useAppData();
  const { showToast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [memberToRemove, setMemberToRemove] = useState(null);

  const members = data.getMemberDetails(trip);
  const canManage = canManageMembers(trip, data.currentUser);
  const acceptedCount = members.filter((member) => member.status === "accepted").length;

  function handleInvite(event) {
    event.preventDefault();
    const result = data.inviteMember(trip._id, inviteEmail, inviteRole);
    showToast(result.message, result.ok ? "success" : "danger");
    if (result.ok) setInviteEmail("");
  }

  function handleRemove() {
    data.removeMember(trip._id, memberToRemove.user._id);
    showToast(`${memberToRemove.user.name} removed from the trip`, "danger");
    setMemberToRemove(null);
  }

  return (
    <Card>
      <CardHeader title="Members" description={`${acceptedCount} of ${trip.maxMembers} joined`} />
      <CardBody className="space-y-4">
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.user._id} className="rounded-lg border border-border px-3 py-2.5">
              <div className="flex items-center gap-3">
                <Avatar name={member.user.name} photo={member.user.photo} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {roleLabel(member.role)} · {member.user.city}
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

              {canManage && member.role !== "owner" ? (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <select
                    aria-label={`Role for ${member.user.name}`}
                    value={member.role}
                    onChange={(event) =>
                      data.setMemberRole(trip._id, member.user._id, event.target.value)
                    }
                    className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {member.status !== "accepted" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => data.setMemberStatus(trip._id, member.user._id, "accepted")}
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
          ))}
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
        message={memberToRemove ? `${memberToRemove.user.name} will lose access to this trip.` : ""}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setMemberToRemove(null)}
      />
    </Card>
  );
}
