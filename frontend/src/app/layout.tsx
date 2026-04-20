'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import theme from '@/theme/theme';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Provider store={store}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        {children}
                    </ThemeProvider>
                </Provider>
            </body>
        </html>
    );
}
