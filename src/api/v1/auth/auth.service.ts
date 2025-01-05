import { supabase } from '@config/supabase.config';
import { ServiceResponse, ServiceResponseType } from '@models/Response';
import { GetSessionResponseDto } from './auth.dtos';

export default class AuthService {
    /**
     *
     * @param authCode
     */
    public async getSession(
        authCode: string,
    ): Promise<ServiceResponse<GetSessionResponseDto>> {
        try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(
                authCode,
            );
            console.log('authCode: ', authCode);
            console.log('data: ', data);
            console.log('error: ', error);

            if (error) {
                return {
                    type: ServiceResponseType.UNAUTHORIZED,
                    message: 'Unauthorized',
                };
            }

            if (!data.user || !data.session) {
                return {
                    type: ServiceResponseType.NOT_FOUND,
                    message: 'User not found',
                };
            }

            return {
                type: ServiceResponseType.SUCCESS,
                data: {
                    user: data.user,
                    session: data.session,
                },
            };
        } catch (error) {
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }
}
