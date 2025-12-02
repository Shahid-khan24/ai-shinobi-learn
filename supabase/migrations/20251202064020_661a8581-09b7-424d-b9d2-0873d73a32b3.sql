-- Create trade offers table
CREATE TABLE public.trade_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  offering_reward_ids UUID[] NOT NULL,
  requesting_reward_ids UUID[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reward gifts table
CREATE TABLE public.reward_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  user_reward_id UUID NOT NULL REFERENCES public.user_rewards(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_gifts ENABLE ROW LEVEL SECURITY;

-- Trade offers policies
CREATE POLICY "Users can view their own trade offers"
ON public.trade_offers
FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create trade offers"
ON public.trade_offers
FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own trade offers"
ON public.trade_offers
FOR UPDATE
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Gift policies
CREATE POLICY "Users can view gifts they sent or received"
ON public.reward_gifts
FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create gifts"
ON public.reward_gifts
FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_trade_offers_updated_at
BEFORE UPDATE ON public.trade_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to complete a trade
CREATE OR REPLACE FUNCTION public.complete_trade(trade_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trade_record RECORD;
  offering_reward UUID;
  requesting_reward UUID;
BEGIN
  -- Get trade details
  SELECT * INTO trade_record
  FROM public.trade_offers
  WHERE id = trade_id
  AND status = 'pending'
  AND (from_user_id = auth.uid() OR to_user_id = auth.uid());
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Transfer offered rewards from sender to receiver
  FOREACH offering_reward IN ARRAY trade_record.offering_reward_ids
  LOOP
    UPDATE public.user_rewards
    SET user_id = trade_record.to_user_id,
        is_new = true
    WHERE id = offering_reward
    AND user_id = trade_record.from_user_id;
  END LOOP;
  
  -- Transfer requested rewards from receiver to sender
  FOREACH requesting_reward IN ARRAY trade_record.requesting_reward_ids
  LOOP
    UPDATE public.user_rewards
    SET user_id = trade_record.from_user_id,
        is_new = true
    WHERE id = requesting_reward
    AND user_id = trade_record.to_user_id;
  END LOOP;
  
  -- Update trade status
  UPDATE public.trade_offers
  SET status = 'accepted',
      updated_at = now()
  WHERE id = trade_id;
  
  RETURN TRUE;
END;
$$;

-- Function to process a gift
CREATE OR REPLACE FUNCTION public.process_gift(gift_user_reward_id UUID, recipient_user_id UUID, gift_message TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gift_id UUID;
BEGIN
  -- Transfer the reward to the recipient
  UPDATE public.user_rewards
  SET user_id = recipient_user_id,
      is_new = true
  WHERE id = gift_user_reward_id
  AND user_id = auth.uid();
  
  -- Create gift record
  INSERT INTO public.reward_gifts (from_user_id, to_user_id, user_reward_id, message)
  VALUES (auth.uid(), recipient_user_id, gift_user_reward_id, gift_message)
  RETURNING id INTO gift_id;
  
  RETURN gift_id;
END;
$$;