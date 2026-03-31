import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Point {
    LATITUDE: number;
    LONGITUDE: number;
}

const BASE_URL = 'http://192.168.1.26:8000';

export default function ClusterDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    
    const clusterId = Number(params.clusterId);
    const dayOfWeek = Number(params.dayOfWeek);
    const hour = Number(params.hour);
    const latCentro = Number(params.latCentro);
    const lonCentro = Number(params.lonCentro);

    const [points, setPoints] = useState<Point[]>([]);

    useEffect(() => {
        const fetchHeatmap = async () => {
            try {
                const response = await axios.post(`${BASE_URL}/cluster-detail`, {
                    cluster_id: clusterId,
                    day_of_week: dayOfWeek,
                    hour: hour
                });
                setPoints(response.data.pontos);
            } catch (e) {
                console.error("Erro ao carregar detalhes do cluster:", e);
            }
        };
        fetchHeatmap();
    }, [clusterId, dayOfWeek, hour]);

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: latCentro,
                    longitude: lonCentro,
                    latitudeDelta: 0.01, // Zoom bem mais próximo
                    longitudeDelta: 0.01,
                }}
            >
                {points.length > 0 && (
                    <Heatmap
                        points={points.map(p => ({ latitude: p.LATITUDE, longitude: p.LONGITUDE, weight: 1 }))}
                        radius={40} 
                        opacity={0.7}
                        gradient={{
                            colors: ["#79bcff", "#ff7f7f", "#ff0000"],
                            startPoints: [0.01, 0.25, 0.8],
                            colorMapSize: 256
                        }}
                    />
                )}
                {/* Marcador central do cluster para referência */}
                <Marker coordinate={{ latitude: latCentro, longitude: lonCentro }} title={`Centro do Cluster ${clusterId}`} />
            </MapView>

            {/* Tecla Voltar Flutuante */}
            <TouchableOpacity style={styles.floatingClose} onPress={() => router.back()}>
                <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>

            <View style={styles.infoOverlay}>
                <Text style={styles.title}>Análise Micro: Cluster {clusterId}</Text>
                <Text style={styles.subtitle}>Frequência Diária / Horária</Text>
                <Text>Pontos Históricos Acumulados: {points.length}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Voltar ao Mapa Geral</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    floatingClose: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    infoOverlay: { 
        position: 'absolute', 
        bottom: 30, 
        left: 20, 
        right: 20, 
        backgroundColor: 'white', 
        padding: 20, 
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    title: { fontWeight: 'bold', fontSize: 20, color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 10 },
    backBtn: { 
        marginTop: 15, 
        backgroundColor: '#2196F3', 
        padding: 12, 
        borderRadius: 12, 
        alignItems: 'center' 
    }
});