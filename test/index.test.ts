import { createCookieSessionStorage } from '@remix-run/node';
import { FacebookStrategy, FacebookStrategyOptions } from '../src';

interface User {
  id: string;
}

describe(FacebookStrategy, () => {
  const options: FacebookStrategyOptions = {
    clientID: '123',
    clientSecret: '123',
    callbackURL: 'https://example.com/callback',
  };

  const verify = jest.fn();

  const sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ['s3cr3t'] },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should have the name of the strategy', () => {
    const strategy = new FacebookStrategy<User>(options, verify);
    expect(strategy.name).toBe('facebook');
  });

  it('if user is already in the session redirect to `/`', async () => {
    const strategy = new FacebookStrategy<User>(options, verify);

    const session = await sessionStorage.getSession();
    session.set('user', { id: '123' });

    const request = new Request('https://example.com/login', {
      headers: { cookie: await sessionStorage.commitSession(session) },
    });

    const user = await strategy.authenticate(request, sessionStorage, {
      sessionKey: 'user',
    });

    expect(user).toEqual({ id: '123' });
  });

  it('if user is already in the session and successRedirect is set throw a redirect', async () => {
    const strategy = new FacebookStrategy<User>(options, verify);

    let session = await sessionStorage.getSession();
    session.set('user', { id: '123' } as User);

    let request = new Request('https://example.com/login', {
      headers: { cookie: await sessionStorage.commitSession(session) },
    });

    try {
      await strategy.authenticate(request, sessionStorage, {
        sessionKey: 'user',
        successRedirect: '/dashboard',
      });
    } catch (error) {
      if (!(error instanceof Response)) throw error;
      expect(error.headers.get('Location')).toBe('/dashboard');
    }
  });

  it('should redirect to authorization if request is not the callback', async () => {
    const strategy = new FacebookStrategy<User>(options, verify);

    const request = new Request('https://example.com/login');

    try {
      await strategy.authenticate(request, sessionStorage, {
        sessionKey: 'user',
      });
    } catch (error) {
      if (!(error instanceof Response)) throw error;

      const redirect = new URL(error.headers.get('Location') as string);

      const session = await sessionStorage.getSession(
        error.headers.get('Set-Cookie')
      );

      expect(error.status).toBe(302);

      expect(redirect.pathname).toBe('/v14.0/dialog/oauth');
      expect(redirect.searchParams.get('response_type')).toBe('code');
      expect(redirect.searchParams.get('scope')).toBe('public_profile,email');
      expect(redirect.searchParams.get('client_id')).toBe(options.clientID);
      expect(redirect.searchParams.get('redirect_uri')).toBe(
        options.callbackURL
      );
      expect(redirect.searchParams.has('state')).toBeTruthy();

      expect(session.get('oauth2:state')).toBe(
        redirect.searchParams.get('state')
      );
    }
  });
});
