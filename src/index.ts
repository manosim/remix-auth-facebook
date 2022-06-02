import {
  OAuth2Profile,
  OAuth2Strategy,
  OAuth2StrategyVerifyParams,
} from 'remix-auth-oauth2';
import type { StrategyVerifyCallback } from 'remix-auth';

import type { FacebookPicture } from './types';

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export interface FacebookStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: string;
}

export type FacebookProfile = {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: [{ value: string }];
  photos: [{ value: string }];
  _json: {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    picture: FacebookPicture;
    email: string;
  };
} & OAuth2Profile;

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export type FacebookExtraParams = {
  // FIXME!
} & Record<string, string | number>;

export class FacebookStrategy<User> extends OAuth2Strategy<
  User,
  FacebookProfile,
  FacebookExtraParams
> {
  public name = 'facebook';
  private readonly scope: string;
  private readonly userInfoURL = 'https://graph.facebook.com/me';

  private readonly profileFields = [
    'id',
    'email',
    'name',
    'first_name',
    'last_name',
    'picture',
  ];

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope = 'public_profile,email',
    }: FacebookStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<FacebookProfile, FacebookExtraParams>
    >
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        authorizationURL: `https://facebook.com/v14.0/dialog/oauth`,
        tokenURL: `https://graph.facebook.com/v14.0/oauth/access_token`,
      },
      verify
    );
    this.scope = scope;
  }

  protected authorizationParams(): URLSearchParams {
    const params = new URLSearchParams({ scope: this.scope });
    return params;
  }

  protected async userProfile(accessToken: string): Promise<FacebookProfile> {
    const requestParams = `?fields=${this.profileFields.join(',')}`;
    const requestUrl = `${this.userInfoURL}${requestParams}`;
    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const raw: FacebookProfile['_json'] = await response.json();
    const profile: FacebookProfile = {
      provider: 'facebook',
      id: raw.id,
      displayName: raw.name,
      name: {
        familyName: raw.last_name,
        givenName: raw.first_name,
      },
      emails: [{ value: raw.email }],
      photos: [{ value: raw.picture.data.url }],
      _json: raw,
    };
    return profile;
  }
}
