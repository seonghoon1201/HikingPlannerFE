import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import IconButton from '../sub/IconButton';
import MapView, { Polyline, Marker } from 'react-native-maps';
import colors from '../sub/colors';
import { WINDOW_HEIGHT } from '../sub/dimensions';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

export default function RouteMore({ route }) {
  const { trail_id, name, endPoint } = route.params;
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await fetch(
          `http://3.34.159.30:8080/api/v1/auth/getTrailData/${trail_id}`
        );
        const data = await response.json();

        // trailData를 파싱하여 좌표 배열로 변환
        const parsedCoordinates = JSON.parse(data.trailData);

        // 좌표 데이터가 배열 형태인지 확인
        if (Array.isArray(parsedCoordinates)) {
          setCoordinates(parsedCoordinates);
        } else {
          console.error('Invalid coordinates format:', parsedCoordinates);
        }
      } catch (error) {
        console.error('Error fetching trail data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [trail_id]);

  if (loading) {
    return <ActivityIndicator size='large' color={colors.primary} />;
  }

  if (!coordinates || coordinates.length === 0) {
    return (
      <View>
        <Text>경로 데이터를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const convertedCoordinates = coordinates.map(([latitude, longitude]) => ({
    latitude: latitude,
    longitude: longitude,
  }));

  const latitudeSum = convertedCoordinates.reduce(
    (sum, coord) => sum + coord.latitude,
    0
  );
  const longitudeSum = convertedCoordinates.reduce(
    (sum, coord) => sum + coord.longitude,
    0
  );
  const count = convertedCoordinates.length;
  const centerLatitude = latitudeSum / count;
  const centerLongitude = longitudeSum / count;
  const latitudeDelta =
    Math.max(
      ...convertedCoordinates.map((coord) =>
        Math.abs(coord.latitude - centerLatitude)
      )
    ) *
      2 +
    0.005;
  const longitudeDelta =
    Math.max(
      ...convertedCoordinates.map((coord) =>
        Math.abs(coord.longitude - centerLongitude)
      )
    ) *
      2 +
    0.005;

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <View style={styles.leftBtn}>
            <IconButton
              iconName='chevron-left'
              onPress={() => navigation.goBack()}
            />
          </View>
          <View style={styles.rightBtn}>
            <IconButton iconName='more-horizontal' />
          </View>
        </View>
        <View style={styles.routeView}>
          <Text style={styles.routeText}>{name}</Text>
          <View style={styles.route}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: centerLatitude,
                longitude: centerLongitude,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
              }}
              provider={PROVIDER_GOOGLE}
            >
              <Polyline
                coordinates={convertedCoordinates}
                strokeColor='#FF0000'
                strokeWidth={6}
              />
              {endPoint && (
                <Marker
                  coordinate={{
                    latitude: endPoint[0],
                    longitude: endPoint[1],
                  }}
                  title='도착'
                />
              )}
            </MapView>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              navigation.navigate('HikingMapView', {
                coordinates: convertedCoordinates,
              })
            }
          >
            <Text style={styles.startText}>등산 시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: WINDOW_HEIGHT * 0.09,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: WINDOW_HEIGHT * 0.035,
  },
  leftBtn: {
    flex: 1,
    alignItems: 'flex-start',
    margin: 5,
  },
  rightBtn: {
    flex: 1,
    alignItems: 'flex-end',
    margin: 5,
  },
  routeView: {
    padding: 15,
    borderBottomWidth: 8,
    borderBottomColor: colors.vectorGray,
    overflow: 'hidden',
  },
  routeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  route: {
    width: '100%',
    height: WINDOW_HEIGHT * 0.4,
    backgroundColor: colors.Gray,
  },
  startButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    padding: 5,
    borderColor: colors.blackmintGreen,
    borderWidth: 5,
    borderRadius: 10,
    backgroundColor: colors.blackmintGreen,
  },
  startText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
});
