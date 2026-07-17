import ProfileLayout from '@/components/ProfileLayout';

export default function ProfileLayoutRoute({ children }: { children: React.ReactNode }) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
