'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Détection du type d'appareil
const getDeviceType = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Parser User Agent (simplifié)
const parseUserAgent = () => {
  if (typeof window === 'undefined') return {};
  
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Détecter le navigateur
  if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung Internet';
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
  else if (ua.indexOf('Trident') > -1) browser = 'Internet Explorer';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';
  else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  
  // Détecter l'OS
  if (ua.indexOf('Windows') > -1) os = 'Windows';
  else if (ua.indexOf('Mac') > -1) os = 'MacOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
  
  return { browser, os };
};

// Récupérer ou créer un visitor_id
const getVisitorId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// Récupérer ou créer un session_id
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Extraire les paramètres UTM de l'URL
const getUtmParams = (searchParams: URLSearchParams) => {
  return {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
  };
};

// Fonction pour envoyer les données de tracking
const trackEvent = async (data: any) => {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Erreur tracking:', error);
  }
};

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const pageStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const { browser, os } = parseUserAgent();
    const deviceType = getDeviceType();

    // Construire l'URL complète
    const pageUrl = window.location.href;
    const pagePath = pathname;
    const pageTitle = document.title;
    const pageReferrer = document.referrer;

    // Paramètres UTM
    const utmParams = getUtmParams(searchParams);

    // Informations de l'appareil
    const deviceInfo = {
      browser,
      os,
      device_type: deviceType,
    };

    // Informations géographiques (timezone seulement côté client)
    const geoInfo = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // 1. TRACKER LA PAGE VUE
    trackEvent({
      event_type: 'page_view',
      session_id: sessionId,
      visitor_id: visitorId,
      page_url: pageUrl,
      page_path: pagePath,
      page_title: pageTitle,
      page_referrer: pageReferrer,
      user_agent: navigator.userAgent,
      device_info: deviceInfo,
      geo_info: geoInfo,
      utm_params: utmParams,
    });

    // Réinitialiser le temps de début de page
    pageStartTime.current = Date.now();

    // 2. HEARTBEAT pour visiteurs actifs (toutes les 30 secondes)
    heartbeatInterval.current = setInterval(() => {
      trackEvent({
        event_type: 'heartbeat',
        session_id: sessionId,
        visitor_id: visitorId,
        page_url: pageUrl,
        page_path: pagePath,
        page_title: pageTitle,
        device_info: deviceInfo,
      });
    }, 30000); // 30 secondes

    // 3. CLEANUP : Enregistrer le temps passé sur la page
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }

      // Calculer le temps passé sur la page
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);

      // Envoyer l'événement de sortie de page
      trackEvent({
        event_type: 'page_exit',
        session_id: sessionId,
        visitor_id: visitorId,
        page_url: pageUrl,
        page_path: pagePath,
        event_data: {
          time_on_page_seconds: timeOnPage,
        },
      });
    };
  }, [pathname, searchParams]);
}
