<?php

/**
 * UserType enum extracted from User constants.
 * Requires PHP 8.1+
 */
enum UserType: string {
    case MEMBER = 'member';
    case ORGANIZER = 'organizer';
    case MODERATOR = 'moderator';
    case ADMIN = 'admin';
}
