import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

const withAuth = (WrappedComponent) => {
  const WithAuthComponent = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
      return <div>Loading...</div>; // Or a proper loading spinner
    }

    if (!user) {
      router.replace('/login');
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
