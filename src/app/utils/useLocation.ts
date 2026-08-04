"use client"
import { useEffect, useState } from "react";

export function useLocation(hasExistingParams: boolean = false) {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                    setReady(true);
                },
                (err) => {
                    console.warn("Error getting location, please enable it to get more accurate search results.", err);
                    setReady(true);
                }
            );
        } else {
            setReady(true);
        }
    }, []);

    const prefix = hasExistingParams ? "&" : "?";
    const locationParams = userLocation
        ? `${prefix}lat=${userLocation.latitude}&lon=${userLocation.longitude}`
        : "";
    return { locationParams, ready };
}