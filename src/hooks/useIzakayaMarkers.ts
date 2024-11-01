import { useState, useEffect, useCallback, useRef } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { supabase } from '../db/config';
import debounce from 'lodash/debounce';

interface IzakayaCluster {
  district: string;
  count: number;
  latitude: number;
  longitude: number;
}

export const useIzakayaMarkers = (
  map: google.maps.Map | null,
  bounds: google.maps.LatLngBounds | null,
  onDistrictSelect: (district: string) => void
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const lastBoundsRef = useRef<string | null>(null);

  const fetchClusters = useCallback(async (bounds: google.maps.LatLngBounds) => {
    // 現在の境界を文字列化して比較用のキーを作成
    const boundsKey = `${bounds.getNorthEast().lat()},${bounds.getNorthEast().lng()},${bounds.getSouthWest().lat()},${bounds.getSouthWest().lng()}`;
    
    // 同じ境界での重複リクエストを防止
    if (boundsKey === lastBoundsRef.current) {
      return;
    }

    try {
      setLoading(true);
      const { data, error: dbError } = await supabase.rpc('get_district_clusters', {
        min_lat: bounds.getSouthWest().lat(),
        min_lng: bounds.getSouthWest().lng(),
        max_lat: bounds.getNorthEast().lat(),
        max_lng: bounds.getNorthEast().lng()
      });

      if (dbError) throw dbError;
      
      // マーカーの更新
      updateMarkers(data || []);
      
      // 成功した境界を保存
      lastBoundsRef.current = boundsKey;
      setError(null);
    } catch (err) {
      console.error('Error fetching clusters:', err);
      setError('クラスターデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [map]);

  const updateMarkers = useCallback((clusters: IzakayaCluster[]) => {
    if (!map) return;

    // 既存のマーカーをクリア
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    // 新しいマーカーを作成
    const newMarkers = clusters.map(cluster => {
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) return null;

      const position = { lat: cluster.latitude, lng: cluster.longitude };
      
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position,
        title: `${cluster.district} (${cluster.count}件)`,
        content: new window.google.maps.marker.PinElement({
          background: '#EF4444',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          scale: 1.2,
          glyph: `${cluster.count}`
        }).element,
      });

      marker.addListener('click', () => {
        onDistrictSelect(cluster.district);
        if (map) {
          map.panTo(position);
          map.setZoom(15);
        }
      });

      return marker;
    }).filter((marker): marker is google.maps.marker.AdvancedMarkerElement => marker !== null);

    markersRef.current = newMarkers;

    // クラスタラーを更新
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(newMarkers as unknown as google.maps.Marker[]);
    } else {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: newMarkers as unknown as google.maps.Marker[],
        renderer: {
          render: ({ count, position }) => {
            if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
              return new google.maps.Marker();
            }
            
            return new google.maps.marker.AdvancedMarkerElement({
              position,
              content: new google.maps.marker.PinElement({
                background: '#EF4444',
                borderColor: '#ffffff',
                glyphColor: '#ffffff',
                glyph: `${count}`,
                scale: 1.4
              }).element,
            }) as unknown as google.maps.Marker;
          }
        }
      });
    }
  }, [map, onDistrictSelect]);

  // デバウンスされたフェッチ関数
  const debouncedFetchClusters = useCallback(
    debounce((bounds: google.maps.LatLngBounds) => {
      fetchClusters(bounds);
    }, 500),
    [fetchClusters]
  );

  useEffect(() => {
    if (!map || !bounds) return;

    debouncedFetchClusters(bounds);

    return () => {
      debouncedFetchClusters.cancel();
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      markersRef.current.forEach(marker => {
        marker.map = null;
      });
      markersRef.current = [];
    };
  }, [map, bounds, debouncedFetchClusters]);

  return {
    markers: markersRef.current,
    loading,
    error
  };
};

export default useIzakayaMarkers;