/// Study session model matching Supabase table structure
class StudySession {
  final String id;
  final int durationMinutes;
  final DateTime startedAt;
  final DateTime endedAt;
  final int leaveCount;
  final String? taskName;
  final String? categoryId;

  const StudySession({
    required this.id,
    required this.durationMinutes,
    required this.startedAt,
    required this.endedAt,
    required this.leaveCount,
    this.taskName,
    this.categoryId,
  });

  factory StudySession.fromJson(Map<String, dynamic> json) {
    return StudySession(
      id: json['id'] as String,
      durationMinutes: json['duration_minutes'] as int,
      startedAt: DateTime.parse(json['started_at'] as String),
      endedAt: DateTime.parse(json['ended_at'] as String),
      leaveCount: json['leave_count'] as int,
      taskName: json['task_name'] as String?,
      categoryId: json['category_id'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'duration_minutes': durationMinutes,
      'started_at': startedAt.toIso8601String(),
      'ended_at': endedAt.toIso8601String(),
      'leave_count': leaveCount,
      'task_name': taskName,
      'category_id': categoryId,
    };
  }
}
