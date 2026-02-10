"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import SuggestedDoctorCard from "./SuggestedDoctorCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SessionDetail } from "../medical-agent/[sessionId]/page";

interface DoctorAgent {
  id: string;
  image: string;
  specialist: string;
  description: string;
  name: string;
}

interface SessionResponse {
  sessionId: string;
}

function AddNewSession() {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[]>([]);
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorAgent | null>(null);
  const router = useRouter();
  const { has, isLoaded } = useAuth();
  const paidUser = isLoaded && has ? has({ plan: "pro" }) : false;

  const GetHistoryList = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const result = await axios.get<SessionDetail[]>("/api/session-chat?sessionId=all");
      setHistoryList(result.data);
    } catch (err) {
      console.error("Failed to fetch session history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    GetHistoryList();
  }, [GetHistoryList]);

  const onClickNext = useCallback(async () => {
    if (!note.trim()) {
      setError("Please enter symptoms or details");
      return;
    }
    if (note.length < 10) {
      setError("Please provide at least 10 characters of details");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<DoctorAgent[]>("/api/suggest-doctors", {
        notes: note,
      });
      setSuggestedDoctors(response.data);
      setSelectedDoctor(response.data[0] || null);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : "Failed to fetch doctor recommendations. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [note]);

  const onStartConsultation = useCallback(async () => {
    if (!selectedDoctor) return;
    setLoading(true);
    setError(null);
    try {
      const result = await axios.post<SessionResponse>("/api/session-chat", {
        notes: note,
        selectedDoctor,
      });
      if (result.data?.sessionId) {
        await GetHistoryList();
        router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : "Failed to start consultation. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [note, selectedDoctor, GetHistoryList, router]);

  const resetForm = useCallback(() => {
    setSuggestedDoctors([]);
    setNote("");
    setError(null);
    setSelectedDoctor(null);
  }, []);

  return (
    <Dialog onOpenChange={(open) => !open && resetForm()}>
      <DialogTrigger asChild>
        <Button className="mt-3" disabled={historyLoading || (!paidUser && historyList.length >= 20)}>
          {historyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "+ Start a Consultation"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle id="dialog-title">
            {suggestedDoctors.length === 0 ? "Add Basic Details" : "Select a Doctor"}
          </DialogTitle>
          <DialogDescription id="dialog-description">
            {suggestedDoctors.length === 0
              ? "Enter your symptoms or details to get doctor recommendations."
              : "Choose a doctor to start your consultation."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4" aria-describedby="dialog-description">
          {suggestedDoctors.length === 0 ? (
            <div>
              <Textarea
                placeholder="Add details here..."
                className="h-[200px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-label="Enter symptoms or consultation details"
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {suggestedDoctors.map((doctor) => (
                <SuggestedDoctorCard
                  key={doctor.id}
                  doctorAgent={doctor}
                  setSelectedDoctor={setSelectedDoctor}
                  selectedDoctor={selectedDoctor}
                />
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </DialogClose>
          {suggestedDoctors.length === 0 ? (
            <Button disabled={!note.trim() || loading} onClick={onClickNext}>
              Next {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button disabled={loading || !selectedDoctor} onClick={onStartConsultation}>
              Start Consultation {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSession;