import { OAuth2Strategy, OAuth2StrategyVerifyParams } from 'remix-auth-oauth2';
import type { StrategyVerifyCallback } from 'remix-auth';

import type {
  AdditionalFacebookProfileField,
  FacebookProfile,
  FacebookScope,
  FacebookExtraParams,
  FacebookStrategyOptions,
} from './types';
export * from './types';

export const baseProfileFields = [
  'id',
  'email',
  'name',
  'first_name',
  'middle_name',
  'last_name',
  'picture',
] as const;

export const FacebookStrategyName = 'facebook';
export const FacebookStrategyDefaultScopes: FacebookScope[] = [
  'public_profile',
  'email',
];
export const FacebookStrategyScopeSeperator = ',';
export type FacebookProfileFields = [
  ...typeof baseProfileFields,
  ...AdditionalFacebookProfileField[]
];

export class FacebookStrategy<User> extends OAuth2Strategy<
  User,
  FacebookProfile,
  FacebookExtraParams
> {
  public name = FacebookStrategyName;
  private readonly scope: FacebookScope[];
  private readonly userInfoURL = 'https://graph.facebook.com/me';

  private readonly profileFields: FacebookProfileFields;

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope,
      extraProfileFields,
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
    this.scope = this.getScope(scope);
    // Ensure unique entries in case they include the base fields
    this.profileFields = [
      ...new Set([...baseProfileFields, ...(extraProfileFields || [])]),
    ] as FacebookProfileFields;
  }

  // Allow users the option to pass a scope string, or typed array
  private getScope(scope: FacebookStrategyOptions['scope']) {
    if (!scope) {
      return FacebookStrategyDefaultScopes;
    } else if (typeof scope === 'string') {
      return scope.split(FacebookStrategyScopeSeperator) as FacebookScope[];
    }

    return scope;
  }

  protected authorizationParams(): URLSearchParams {
    const params = new URLSearchParams({
      scope: this.scope.join(FacebookStrategyScopeSeperator),
    });

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
