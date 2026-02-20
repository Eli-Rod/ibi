import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    },

    text: {
      textAlign: 'center',
      marginBottom: 20,
      paddingHorizontal: 40,
      color: t.colors.text,
    },

    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
    },

    buttonText: {
      color: '#fff',
      fontWeight: '700',
    },

    /* ================= HEADER ================= */

    header: {
      position: 'absolute',
      top: 70,
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 20,
    },

    headerText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
      marginTop: 10,
      textAlign: 'center',
    },

    subHeaderText: {
      color: '#fff',
      opacity: 0.8,
      fontSize: 14,
      marginTop: 4,
      textAlign: 'center',
    },

    backBtn: {
      marginBottom: 10,
    },

    /* ================= CAMERA ================= */

    cameraFill: {
      ...StyleSheet.absoluteFillObject,
    },

    /* ================= OVERLAY ================= */

    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },

    unfocusedContainer: {
      flex: 1,
      width: '100%',
      backgroundColor: 'rgba(0,0,0,0.65)',
    },

    middleContainer: {
      flexDirection: 'row',
      height: 260,
    },

    focusedContainer: {
      width: 260,
      borderWidth: 3,
      borderRadius: 24,
      backgroundColor: 'transparent',
    },
  });
