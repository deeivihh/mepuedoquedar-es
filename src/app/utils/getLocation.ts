"use client"
import { useEffect, useState } from "react";

export function useLocation() {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                },
                (err) => console.warn("Error getting location, please enable it to get more accurate search results.", err)
            );
        }
    }, []);
    const locationParams = userLocation
        ? `&lat=${userLocation.latitude}&lon=${userLocation.longitude}`
        : "";
    return locationParams;
}