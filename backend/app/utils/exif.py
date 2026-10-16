import io
from typing import Optional, Tuple
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def _convert_to_degrees(value) -> float:
    """Converts GPS tuple/list (degrees, minutes, seconds) to decimal float."""
    try:
        # Value can be IFDRational or tuple of numbers
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except Exception:
        try:
            return float(value)
        except Exception:
            return 0.0

def extract_gps_from_bytes(image_bytes: bytes) -> Optional[Tuple[float, float]]:
    """
    Extracts (latitude, longitude) from raw image bytes using Pillow.
    Supports modern Pillow IFD GPS parsing as well as legacy _getexif().
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))

        gps_data = {}

        # Method 1: Modern Pillow getexif() with IFD
        try:
            exif = image.getexif()
            if exif:
                # 0x8825 is the tag ID for GPSInfo IFD
                gps_ifd = exif.get_ifd(0x8825)
                if gps_ifd:
                    for tag_id, val in gps_ifd.items():
                        tag_name = GPSTAGS.get(tag_id, str(tag_id))
                        gps_data[tag_name] = val
        except Exception:
            pass

        # Method 2: Legacy _getexif() fallback
        if not gps_data:
            try:
                raw_exif = image._getexif()
                if raw_exif:
                    for tag, value in raw_exif.items():
                        decoded = TAGS.get(tag, tag)
                        if decoded == "GPSInfo" or tag == 34853:
                            if isinstance(value, dict):
                                for t, v in value.items():
                                    sub_decoded = GPSTAGS.get(t, str(t))
                                    gps_data[sub_decoded] = v
            except Exception:
                pass

        if not gps_data:
            return None

        # Keys can be named or integer tags (1=LatRef, 2=Lat, 3=LonRef, 4=Lon)
        gps_latitude = gps_data.get("GPSLatitude") or gps_data.get(2)
        gps_latitude_ref = gps_data.get("GPSLatitudeRef") or gps_data.get(1)
        gps_longitude = gps_data.get("GPSLongitude") or gps_data.get(4)
        gps_longitude_ref = gps_data.get("GPSLongitudeRef") or gps_data.get(3)

        if gps_latitude and gps_longitude:
            lat = _convert_to_degrees(gps_latitude)
            ref_lat = str(gps_latitude_ref).upper() if gps_latitude_ref else "N"
            if ref_lat.startswith("S"):
                lat = -lat

            lon = _convert_to_degrees(gps_longitude)
            ref_lon = str(gps_longitude_ref).upper() if gps_longitude_ref else "E"
            if ref_lon.startswith("W"):
                lon = -lon

            # Sanity check for Karachi / global latitude longitude
            if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0 and (lat != 0.0 or lon != 0.0):
                return round(lat, 6), round(lon, 6)

    except Exception as e:
        pass

    return None
