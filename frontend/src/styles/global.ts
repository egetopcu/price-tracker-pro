import { StyleSheet } from 'react-native';

export const colors = {
  background: '#333345',
  header: '#242444',
  surface: '#2a2a4a',
  primary: '#4fc3f7',
  text: 'rgb(219 213 213)',
  textSecondary: '#a0a0b0',
  alert: '#ff5252',
  cardColor:"#ffffff22",
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 30,
    marginBottom: 16,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.cardColor,
  },
});