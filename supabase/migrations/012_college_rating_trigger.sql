CREATE OR REPLACE FUNCTION public.recalculate_college_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_college_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_college_id := OLD.college_id;
  ELSE
    v_college_id := NEW.college_id;
  END IF;

  UPDATE public.colleges
  SET
    rating_avg = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.college_reviews WHERE college_id = v_college_id),
    rating_count = (SELECT COUNT(*) FROM public.college_reviews WHERE college_id = v_college_id),
    updated_at = NOW()
  WHERE id = v_college_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_college_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.college_reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_college_rating();
