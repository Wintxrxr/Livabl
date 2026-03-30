"""
Ward endpoints returning enhanced scores with breakdowns.
"""

from flask import Blueprint, jsonify
from scoring.engine import ScoringEngine

wards_bp = Blueprint('wards', __name__, url_prefix='/api/wards')

engine = ScoringEngine()


@wards_bp.route('/<ward_id>/score', methods=['GET'])
def get_ward_score(ward_id):
    try:
        ward = fetch_ward_from_db(ward_id)
        if not ward:
            return jsonify({'error': 'Ward not found'}), 404
        score_result = engine.calculate_ward_score(
            ward_name=ward['name'],
            healthcare_score=ward.get('hospital_score', 50),
            education_score=ward.get('school_score', 50),
            connectivity_score=ward.get('metro_score', 50),
            aqi_value=ward.get('aqi', None),
            civic_score=ward.get('civic_score', 50),
            sentiment_score=ward.get('sentiment_score', 50)
        )
 
        return jsonify(score_result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@wards_bp.route('/compare', methods=['POST'])
def compare_wards():
    data = request.get_json()
    ward_ids = data.get('ward_ids', [])
    results = []
    for ward_id in ward_ids:
        ward = fetch_ward_from_db(ward_id)
        if ward:
            score_result = engine.calculate_ward_score(
                ward_name=ward['name'],
                healthcare_score=ward.get('hospital_score', 50),
                education_score=ward.get('school_score', 50),
                connectivity_score=ward.get('metro_score', 50),
                aqi_value=ward.get('aqi', None),
                civic_score=ward.get('civic_score', 50),
                sentiment_score=ward.get('sentiment_score', 50)
            )
            results.append(score_result)
    return jsonify({'wards': results})
