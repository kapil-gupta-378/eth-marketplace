import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const offerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  offerType: z.enum(["cash", "tokens", "nft", "irl", "other"]),
  category: z.enum(["defi", "nft", "irl", "other"]),
  rewardValue: z.string().optional(),
  expiryDate: z.string().optional(),
  contactInfo: z.string().optional(),
  termsLink: z.string().optional(),
  fromAnonymousTag: z.string().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWallet: string | null;
}

export default function OfferModal({
  isOpen,
  onClose,
  targetWallet,
}: OfferModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      offerType: "cash",
      category: "defi",
      rewardValue: "",
      expiryDate: "",
      contactInfo: "",
      termsLink: "",
      fromAnonymousTag: "",
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      // Find target wallet ID by address
      const walletsResponse = await fetch(
        `/api/wallets?search=${targetWallet}&limit=1`
      );
      const walletsData = await walletsResponse.json();

      if (!walletsData.wallets || walletsData.wallets.length === 0) {
        throw new Error("Target wallet not found");
      }

      const targetWalletId = walletsData.wallets[0].id;

      const offerData = {
        ...data,
        targetWalletId,
        rewardValue: data.rewardValue
          ? parseFloat(data.rewardValue)
          : undefined,
        expiryDate: data.expiryDate
          ? new Date(data.expiryDate).toISOString()
          : undefined,
      };

      return apiRequest("POST", "/api/offers", offerData);
    },
    onSuccess: () => {
      toast({
        title: "Offer Sent",
        description: "Your offer has been sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Offer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: OfferFormData) => {
    setIsSubmitting(true);
    try {
      await createOfferMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Offer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., $200 for 30-day staking"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select offer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash Reward</SelectItem>
                        <SelectItem value="tokens">Token Reward</SelectItem>
                        <SelectItem value="nft">NFT Reward</SelectItem>
                        <SelectItem value="irl">IRL Perk</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="defi">DeFi</SelectItem>
                        <SelectItem value="nft">NFT</SelectItem>
                        <SelectItem value="irl">IRL</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rewardValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward Value (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your offer in detail..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Email or wallet address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Offer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
