import { BaseService, ServiceResponse } from './base.service';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  language: string;
  country: string;
  city?: string;
  address?: string;
  role: 'customer' | 'vendor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  language?: string;
  country?: string;
  city?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  profile?: UserProfile | null;
}

export class AuthService extends BaseService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async signUp(signUpData: SignUpData): Promise<ServiceResponse<AuthResponse>> {
    try {
      const { data, error } = await this.getSupabaseClient().auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            first_name: signUpData.first_name,
            last_name: signUpData.last_name,
            phone: signUpData.phone
          }
        }
      });

      if (error) throw error;

      // Le profil sera créé automatiquement par le trigger de la base de données
      let profile = null;
      if (data.user) {
        const profileResponse = await this.getProfile(data.user.id);
        if (profileResponse.success) {
          profile = profileResponse.data;
        }
      }

      return this.createResponse({
        user: data.user,
        session: data.session,
        profile
      });
    } catch (error) {
      return this.createResponse({ user: null, session: null, profile: null }, this.handleError(error));
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async signIn(signInData: SignInData): Promise<ServiceResponse<AuthResponse>> {
    try {
      const { data, error } = await this.getSupabaseClient().auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      });

      if (error) throw error;

      // Récupérer le profil utilisateur
      let profile = null;
      if (data.user) {
        const profileResponse = await this.getProfile(data.user.id);
        if (profileResponse.success) {
          profile = profileResponse.data;
        }
      }

      return this.createResponse({
        user: data.user,
        session: data.session,
        profile
      });
    } catch (error) {
      return this.createResponse({ user: null, session: null, profile: null }, this.handleError(error));
    }
  }

  /**
   * Déconnexion
   */
  static async signOut(): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().auth.signOut();
      
      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  static async getCurrentUser(): Promise<ServiceResponse<AuthResponse>> {
    try {
      // First, get the session which includes the user
      const { data: { session }, error: sessionError } = await this.getSupabaseClient().auth.getSession();
      
      if (sessionError) {
        console.warn('Session error:', sessionError);
        throw sessionError;
      }

      // If no session, return empty response
      if (!session || !session.user) {
        console.log('No active session found');
        return this.createResponse({
          user: null,
          session: null,
          profile: null
        });
      }

      console.log('Active session found for user:', session.user.email);

      // Récupérer le profil si l'utilisateur existe
      let profile = null;
      if (session.user) {
        const profileResponse = await this.getProfile(session.user.id);
        if (profileResponse.success) {
          profile = profileResponse.data;
        } else {
          console.warn('Failed to load profile:', profileResponse.error);
        }
      }

      return this.createResponse({
        user: session.user,
        session,
        profile
      });
    } catch (error) {
      return this.createResponse({ user: null, session: null, profile: null }, this.handleError(error));
    }
  }

  /**
   * Récupérer le profil d'un utilisateur
   */
  static async getProfile(userId: string): Promise<ServiceResponse<UserProfile>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null as unknown as UserProfile, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateProfile(userId: string, updateData: UpdateProfileData): Promise<ServiceResponse<UserProfile>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null as unknown as UserProfile, this.handleError(error));
    }
  }

  /**
   * Changer le mot de passe
   */
  static async changePassword(passwordData: ChangePasswordData): Promise<ServiceResponse<boolean>> {
    try {
      // Vérifier d'abord le mot de passe actuel en tentant une reconnexion
      const { data: { user } } = await this.getSupabaseClient().auth.getUser();
      
      if (!user?.email) {
        return this.createResponse(false, 'Utilisateur non connecté');
      }

      // Tenter de se reconnecter avec le mot de passe actuel
      const { error: signInError } = await this.getSupabaseClient().auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        return this.createResponse(false, 'Mot de passe actuel incorrect');
      }

      // Changer le mot de passe
      const { error } = await this.getSupabaseClient().auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Réinitialiser le mot de passe
   */
  static async resetPassword(email: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
      });

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Confirmer la réinitialisation du mot de passe
   */
  static async confirmPasswordReset(newPassword: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Connexion avec Google
   */
  static async signInWithGoogle(): Promise<ServiceResponse<{ url: string }>> {
    try {
      const { data, error } = await this.getSupabaseClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        }
      });

      if (error) throw error;

      return this.createResponse({ url: data.url });
    } catch (error) {
      return this.createResponse({ url: '' }, this.handleError(error));
    }
  }

  /**
   * Connexion avec Facebook
   */
  static async signInWithFacebook(): Promise<ServiceResponse<{ url: string }>> {
    try {
      const { data, error } = await this.getSupabaseClient().auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        }
      });

      if (error) throw error;

      return this.createResponse({ url: data.url });
    } catch (error) {
      return this.createResponse({ url: '' }, this.handleError(error));
    }
  }

  /**
   * Vérifier l'email
   */
  static async verifyEmail(token: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Renvoyer l'email de vérification
   */
  static async resendVerificationEmail(email: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Mettre à jour l'email
   */
  static async updateEmail(newEmail: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Supprimer le compte utilisateur
   */
  static async deleteAccount(): Promise<ServiceResponse<boolean>> {
    try {
      const { data: { user } } = await this.getSupabaseClient().auth.getUser();
      
      if (!user) {
        return this.createResponse(false, 'Utilisateur non connecté');
      }

      // Supprimer le profil (cascade supprimera les autres données)
      const { error: profileError } = await this.getSupabaseClient()
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Déconnecter l'utilisateur
      await this.signOut();

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Vérifier si un email existe déjà
   */
  static async checkEmailExists(email: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return this.createResponse(!!data);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Obtenir les statistiques utilisateur
   */
  static async getUserStats(userId: string): Promise<ServiceResponse<{
    totalOrders: number;
    totalSpent: number;
    wishlistItems: number;
    cartItems: number;
    reviewsCount: number;
  }>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .rpc('get_user_stats', { user_id: userId });

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse({
        totalOrders: 0,
        totalSpent: 0,
        wishlistItems: 0,
        cartItems: 0,
        reviewsCount: 0,
      }, this.handleError(error));
    }
  }
}