import { Session, User } from '@supabase/supabase-js';

export interface GetSessionResponseDto {
    user: User;
    session: Session;
}
