export type ClassificationTableResponse = {
    data: {
        count: number,
        standings: {
            tag_id: string,
            laps: number,
            last_pass_time: string,
            finish_time: string | null,
            finished: boolean,
            total_time_ms: number,
            gap_ms: number,
            laps_behind: number
        }[]
    }
}