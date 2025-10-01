import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
    message?: string;
    className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
    message = 'Chargement...',
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
            <Loader2 className="w-8 h-8 animate-spin text-jomionstore-primary mb-4" />
            <p className="text-gray-600 text-sm">{message}</p>
        </div>
    );
};

export const FullPageLoading: React.FC<PageLoadingProps> = ({
    message = 'Chargement...',
    className = ''
}) => {
    return (
        <div className={`fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 ${className}`}>
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
                <Loader2 className="w-12 h-12 animate-spin text-jomionstore-primary mb-4" />
                <p className="text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
};

export const InlineLoading: React.FC<PageLoadingProps> = ({
    message = 'Chargement...',
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-center py-8 ${className}`}>
            <Loader2 className="w-5 h-5 animate-spin text-jomionstore-primary mr-2" />
            <span className="text-gray-600 text-sm">{message}</span>
        </div>
    );
};

export default PageLoading;