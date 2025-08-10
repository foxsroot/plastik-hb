import { sendAnalyticsEvent } from "../api/analyticApi";

export function useAnalytics() {
    function trackPageView(pageId: string, slug: string) {
        sendAnalyticsEvent({
            type: "PAGE",
            targetId: pageId,
            url: slug,
        });
    }
    function trackProductClick(productId: string) {
        sendAnalyticsEvent({
            type: "PRODUCT",
            targetId: productId,
            url: window.location.href,
        });
    }
    return { trackPageView, trackProductClick };
}