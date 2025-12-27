export const themes = {
  light: {
    background: 'bg-gray-50',
    surface: 'bg-white',
    surfaceHover: 'hover:bg-gray-50',
    border: 'border-gray-200',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500'
    },
    button: {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900'
    },
    card: 'bg-white border-gray-200 shadow-sm',
    input: 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
  },
  dark: {
    background: 'bg-gradient-to-br from-purple-900 via-gray-900 to-black',
    surface: 'bg-white/10 backdrop-blur-md',
    surfaceHover: 'hover:bg-white/20',
    border: 'border-white/20',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400'
    },
    button: {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white',
      secondary: 'bg-white/10 hover:bg-white/20 text-white'
    },
    card: 'bg-white/10 backdrop-blur-md border-white/20',
    input: 'bg-white/5 border-white/20 text-white focus:border-purple-500'
  }
};

export const getThemeClasses = (isDark) => {
  return isDark ? themes.dark : themes.light;
};
