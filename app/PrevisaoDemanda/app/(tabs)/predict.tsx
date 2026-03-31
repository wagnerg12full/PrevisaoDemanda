import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import axios from 'axios';

import { useRouter } from 'expo-router';

// Interfaces
interface ClusterPrediction {
    cluster: number;
    lat_centro: number;
    lon_centro: number;
    pedidos_esperados: number;
    nivel_criticidade: 'ALTO' | 'NORMAL' | 'CRITICO' | 'ATENCAO';
}

const BASE_URL = 'http://192.168.1.26:8000';

export default function PredictScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [previsoes, setPrevisoes] = useState<ClusterPrediction[]>([]);
    const [date, setDate] = useState<Date>(new Date());

    // 'hour' controla a API, 'displayHour' controla apenas o texto no Slider
    const [hour, setHour] = useState<number>(new Date().getHours());
    const [displayHour, setDisplayHour] = useState<number>(new Date().getHours());

    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    const fetchData = useCallback(async (selectedDate: Date, selectedHour: number) => {
        setLoading(true);
        try {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const response = await axios.post(`${BASE_URL}/prever`, {
                data_futura: formattedDate,
                hour: selectedHour
            });
            setPrevisoes(response.data.previsoes);
        } catch (error) {
            console.error("Erro na API:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Dispara a API apenas quando 'hour' ou 'date' mudam de fato
    useEffect(() => {
        fetchData(date, hour);
    }, [date, hour, fetchData]);

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={{
                latitude: -3.789, longitude: -38.545,
                latitudeDelta: 0.25, longitudeDelta: 0.25,
            }}>
                {previsoes.map((p) => (
                    <React.Fragment key={p.cluster}>
                        <Circle
                            center={{ latitude: p.lat_centro, longitude: p.lon_centro }}
                            // Multiplicador mais agressivo para dar volume visual ao "susto"
                            radius={p.pedidos_esperados * 350}
                            fillColor={
                                p.nivel_criticidade === 'CRITICO' ? 'rgba(255, 0, 0, 0.6)' :
                                    p.nivel_criticidade === 'ATENCAO' ? 'rgba(255, 165, 0, 0.5)' :
                                        'rgba(52, 199, 89, 0.3)'
                            }
                            strokeColor={p.nivel_criticidade === 'CRITICO' ? 'red' : 'green'}
                            strokeWidth={p.nivel_criticidade === 'CRITICO' ? 3 : 1}
                        />
                        <Marker 
                            coordinate={{ latitude: p.lat_centro, longitude: p.lon_centro }}
                            onPress={() => router.push({ pathname: '/clusterDetail', params: { clusterId: p.cluster, dayOfWeek: date.getDay(), hour: hour, latCentro: p.lat_centro, lonCentro: p.lon_centro } })}
                        >
                            <View style={[styles.markerLabel, { borderColor: p.nivel_criticidade === 'ALTO' ? 'red' : '#ccc' }]}>
                                <Text style={styles.markerText}>{Math.round(p.pedidos_esperados)}</Text>
                            </View>
                        </Marker>
                    </React.Fragment>
                ))}
            </MapView>

            {/* Legenda Flutuante */}
            <View style={styles.legendContainer}>
                <Text style={styles.legendTitle}>🚨 Termômetro de Surtos</Text>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#FF0000' }]} />
                    <Text style={styles.legendText}>{"Crítico (Média > 7.5: Crítico)"}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#FFA500' }]} />
                    <Text style={styles.legendText}>{"Atenção (Média > 5.0: Carga Alta)"}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
                    <Text style={styles.legendText}>{"Normal (Média < 5.0)"}</Text>
                </View>
            </View>

            <View style={styles.sliderCard}>
                <View style={styles.sliderInfo}>
                    <Text style={styles.sliderLabel}>📅 {date.toLocaleDateString('pt-BR')}</Text>
                    <Text style={styles.sliderValue} onPress={() => setShowCalendar(true)}>
                        {displayHour.toString().padStart(2, '0')}:00h ✏️
                    </Text>
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={0} maximumValue={23} step={1}
                    value={hour}
                    onValueChange={(v) => setDisplayHour(v)} // Muda o texto na hora
                    onSlidingComplete={(v) => setHour(v)}   // Só chama a API ao soltar
                    minimumTrackTintColor="#2196F3"
                    thumbTintColor="#2196F3"
                />
                {loading && <ActivityIndicator size="small" color="#2196F3" />}
            </View>

            {showCalendar && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    onChange={(_e, d) => { setShowCalendar(false); if (d) setDate(d); }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
    legendContainer: {
        position: 'absolute', top: 50, right: 20,
        backgroundColor: 'white', padding: 10, borderRadius: 12,
        elevation: 5, shadowOpacity: 0.1
    },
    legendTitle: { fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    legendText: { fontSize: 11, color: '#444' },
    legendNote: { fontSize: 9, color: '#888', marginTop: 5, fontStyle: 'italic' },
    sliderCard: {
        position: 'absolute', bottom: 30, left: 15, right: 15,
        backgroundColor: 'white', padding: 15, borderRadius: 20, elevation: 10
    },
    sliderInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    sliderLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
    sliderValue: { fontSize: 18, fontWeight: 'bold', color: '#2196F3' },
    slider: { width: '100%', height: 40 },
    markerLabel: { backgroundColor: 'white', padding: 3, borderRadius: 6, borderWidth: 2 },
    markerText: { fontWeight: 'bold', fontSize: 11 }
});