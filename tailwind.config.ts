
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: '#2D2D2D',
				input: '#232323',
				ring: '#232323',
				background: '#18181B', // blackish
				foreground: '#F4F4F5', // near white
				primary: {
					DEFAULT: '#232323', // dark gray
					foreground: '#F4F4F5',
				},
				secondary: {
					DEFAULT: '#2D2D2D', // medium gray
					foreground: '#F4F4F5',
				},
				destructive: {
					DEFAULT: '#7F1D1D',
					foreground: '#F4F4F5',
				},
				muted: {
					DEFAULT: '#52525B', // muted gray
					foreground: '#D4D4D8',
				},
				accent: {
					DEFAULT: '#18181B',
					foreground: '#F4F4F5',
				},
				popover: {
					DEFAULT: '#232323',
					foreground: '#F4F4F5',
				},
				card: {
					DEFAULT: '#232323',
					foreground: '#F4F4F5',
				},
				// DEX Custom Colors
				dex: {
					dark: '#18181B',
					gray: '#52525B',
					// purple: '#8B5CF6', // removed
					// blue: '#0EA5E9', // removed
					// 'light-purple': '#E5DEFF', // removed
					// 'light-blue': '#D3E4FD', // removed
				},
				sidebar: {
					DEFAULT: '#232323',
					foreground: '#F4F4F5',
					primary: '#18181B',
					'primary-foreground': '#F4F4F5',
					accent: '#52525B',
					'accent-foreground': '#F4F4F5',
					border: '#2D2D2D',
					ring: '#232323',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'ping-slow': {
					'75%, 100%': {
						transform: 'scale(1.2)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'dex-gradient': 'linear-gradient(135deg, var(--tw-gradient-stops))',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
