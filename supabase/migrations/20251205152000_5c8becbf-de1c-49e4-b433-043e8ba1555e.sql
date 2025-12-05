-- Create marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_reward_id UUID NOT NULL REFERENCES public.user_rewards(id) ON DELETE CASCADE,
  asking_description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active marketplace listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active');

-- Users can view their own listings regardless of status
CREATE POLICY "Users can view own listings"
ON public.marketplace_listings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create listings for their own rewards
CREATE POLICY "Users can create listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
ON public.marketplace_listings
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
ON public.marketplace_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to claim a marketplace listing
CREATE OR REPLACE FUNCTION public.claim_marketplace_listing(listing_id UUID, offered_reward_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  listing_record RECORD;
BEGIN
  -- Get listing details
  SELECT * INTO listing_record
  FROM public.marketplace_listings
  WHERE id = listing_id
  AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Can't claim own listing
  IF listing_record.user_id = auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Verify the offered reward belongs to the claiming user
  IF NOT EXISTS (
    SELECT 1 FROM public.user_rewards 
    WHERE id = offered_reward_id AND user_id = auth.uid()
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Transfer listed reward to claimer
  UPDATE public.user_rewards
  SET user_id = auth.uid(), is_new = true
  WHERE id = listing_record.user_reward_id
  AND user_id = listing_record.user_id;
  
  -- Transfer offered reward to lister
  UPDATE public.user_rewards
  SET user_id = listing_record.user_id, is_new = true
  WHERE id = offered_reward_id
  AND user_id = auth.uid();
  
  -- Mark listing as completed
  UPDATE public.marketplace_listings
  SET status = 'completed', updated_at = now()
  WHERE id = listing_id;
  
  RETURN TRUE;
END;
$$;