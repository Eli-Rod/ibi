import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing(2),
      gap: theme.spacing(3),
    },
    
    // Quick Access Grid
    quickAccessGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: theme.spacing(1),
      gap: theme.spacing(1.5),
    },
    quickAccessCard: {
      width: '48%',
      aspectRatio: 1.2,
      borderRadius: theme.radius,
      overflow: 'hidden',
      // Sombra manual
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    quickAccessGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    quickAccessText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    // Sections
    section: {
      gap: theme.spacing(2),
    },
    featuredSection: {
      gap: theme.spacing(2),
      marginTop: theme.spacing(1),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    featuredTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },

    // Featured Event
    featuredEventCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing(2),
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      // Sombra manual
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    featuredEventDate: {
      width: 60,
      height: 60,
      borderRadius: theme.radius / 1.5,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing(2),
    },
    featuredEventDay: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FFFFFF',
      lineHeight: 28,
    },
    featuredEventMonth: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
      opacity: 0.9,
    },
    featuredEventInfo: {
      flex: 1,
      gap: theme.spacing(0.5),
    },
    featuredEventName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing(0.5),
    },
    featuredEventDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(0.5),
    },
    featuredEventDetailText: {
      fontSize: 12,
      color: theme.colors.muted,
      flex: 1,
    },

    // Announcements
    announcementsList: {
      gap: theme.spacing(1),
    },
    announcementItem: {
      marginBottom: theme.spacing(1),
    },

    // Events List
    eventsList: {
      gap: theme.spacing(1.5),
    },

    // Loading States
    loadingContainer: {
      padding: theme.spacing(5),
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Empty States
    emptyState: {
      padding: theme.spacing(5),
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(2),
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.muted,
      textAlign: 'center',
    },

    // Bottom Spacing
    bottomSpacing: {
      height: theme.spacing(4),
    },
  });