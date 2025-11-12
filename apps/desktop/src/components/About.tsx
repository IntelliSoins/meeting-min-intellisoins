import React from "react";
import { invoke } from '@tauri-apps/api/core';
import Image from 'next/image';
import AnalyticsConsentSwitch from "./AnalyticsConsentSwitch";
import { useTranslations } from 'next-intl';


export function About() {
    const t = useTranslations('about');

    const handleContactClick = async () => {
        try {
            await invoke('open_external_url', { url: 'https://meetily.zackriya.com/#about' });
        } catch (error) {
            console.error('Failed to open link:', error);
        }
    };

    return (
        <div className="p-4 space-y-4 h-[80vh] overflow-y-auto">
            {/* Compact Header */}
            <div className="text-center">
                <div className="mb-3">
                    <Image
                        src="icon_128x128.png"
                        alt={t('title')}
                        width={64}
                        height={64}
                        className="mx-auto"
                    />
                </div>
                {/* <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1> */}
                <span className="text-sm text-gray-500">{t('version')}</span>
                <p className="text-medium text-gray-600 mt-1">
                    {t('tagline')}
                </p>
            </div>

            {/* Features Grid - Compact */}
            <div className="space-y-3">
                <h2 className="text-base font-semibold text-gray-800">{t('whatMakesDifferent')}</h2>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors">
                        <h3 className="font-bold text-sm text-gray-900 mb-1">{t('privacyFirst')}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{t('privacyDescription')}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors">
                        <h3 className="font-bold text-sm text-gray-900 mb-1">{t('useAnyModel')}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{t('useAnyModelDescription')}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors">
                        <h3 className="font-bold text-sm text-gray-900 mb-1">{t('costSmart')}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{t('costSmartDescription')}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors">
                        <h3 className="font-bold text-sm text-gray-900 mb-1">{t('worksEverywhere')}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{t('worksEverywhereDescription')}</p>
                    </div>
                </div>
            </div>

            {/* Coming Soon - Compact */}
            <div className="bg-blue-50 rounded p-3">
                <p className="text-s text-blue-800">
                    <span className="font-bold">{t('comingSoon')}</span> {t('comingSoonDescription')}
                </p>
            </div>

            {/* CTA Section - Compact */}
            <div className="text-center space-y-2">
                <h3 className="text-medium font-semibold text-gray-800">{t('readyToPush')}</h3>
                <p className="text-s text-gray-600">
                    {t('customSolution')}
                </p>
                <button
                    onClick={handleContactClick}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                    {t('chatWithTeam')}
                </button>
            </div>

            {/* Footer - Compact */}
            <div className="pt-2 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400">
                    {t('builtBy')}
                </p>
            </div>
            <AnalyticsConsentSwitch />
        </div>

    )
}