"use client";

import { useEffect, useState, useCallback } from "react";

let globalUserLocation: { latitude: number; longitude: number } | null = null;
let globalPermissionDenied = false;
let globalReady = false;
let isQuerying = false;
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

export function useLocation(hasExistingParams = false) {
    const [userLocation, setUserLocation] = useState(globalUserLocation);
    const [ready, setReady] = useState(globalReady);
    const [permissionDenied, setPermissionDenied] = useState(globalPermissionDenied);

    const requestLocation = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            if (typeof window === "undefined" || !("geolocation" in navigator)) {
                globalReady = true;
                setReady(true);
                notify();
                resolve(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    globalUserLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    globalPermissionDenied = false;
                    globalReady = true;
                    setUserLocation(globalUserLocation);
                    setPermissionDenied(false);
                    setReady(true);
                    notify();
                    resolve(true);
                },
                (err) => {
                    if (err.code === 1) {
                        globalPermissionDenied = true;
                        setPermissionDenied(true);
                    }
                    console.warn("Error getting location, please enable it to get more accurate search results.", err);
                    globalReady = true;
                    setReady(true);
                    notify();
                    resolve(false);
                }
            );
        });
    }, []);

    useEffect(() => {
        const onChange = () => {
            setUserLocation(globalUserLocation);
            setReady(globalReady);
            setPermissionDenied(globalPermissionDenied);
        };
        listeners.add(onChange);

        if (typeof navigator !== "undefined" && "permissions" in navigator) {
            navigator.permissions.query({ name: "geolocation" as PermissionName }).then((status) => {
                if (status.state === "denied") {
                    globalPermissionDenied = true;
                    setPermissionDenied(true);
                    notify();
                }
                status.onchange = () => {
                    if (status.state === "denied") {
                        globalPermissionDenied = true;
                    } else if (status.state === "granted") {
                        globalPermissionDenied = false;
                    }
                    notify();
                };
            }).catch(() => {});
        }

        if (!globalReady && !isQuerying) {
            isQuerying = true;
            requestLocation();
        }

        return () => {
            listeners.delete(onChange);
        };
    }, [requestLocation]);

    const prefix = hasExistingParams ? "&" : "?";
    const locationParams = userLocation ? `${prefix}lat=${userLocation.latitude}&lon=${userLocation.longitude}` : "";
    return { locationParams, ready, permissionDenied, userLocation, requestLocation };
}
